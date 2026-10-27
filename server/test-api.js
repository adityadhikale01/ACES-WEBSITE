process.env.NODE_ENV = 'test';

import http from 'http';
import { app } from './dist/index.js';
import { connectDB } from './dist/config/db.js';
import { Event } from './dist/models/Event.js';

const runTests = async () => {
  console.log('\n======================================================');
  console.log('🏁 RUNNING ACES KBTCOE FULL-STACK API TESTS');
  console.log('======================================================\n');

  await connectDB();

  // Ensure event deadlines are in the future for testing
  await Event.updateMany(
    {},
    {
      $set: {
        registrationDeadline: new Date('2026-12-31T23:59:59Z'),
        startDate: new Date('2027-01-15T10:00:00Z'),
      },
    }
  );

  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(5099, resolve));
  const baseUrl = 'http://localhost:5099';

  let passed = 0;
  let failed = 0;

  const assert = (condition, testName) => {
    if (condition) {
      console.log(`✅ [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${testName}`);
      failed++;
    }
  };

  try {
    // 1. Health check
    const healthRes = await fetch(`${baseUrl}/health`);
    const healthData = await healthRes.json();
    assert(healthRes.status === 200 && healthData.status === 'healthy', 'Health check returns status: healthy');

    // 2. Public Events
    const eventsRes = await fetch(`${baseUrl}/api/v1/events`);
    const eventsData = await eventsRes.json();
    assert(
      eventsRes.status === 200 && Array.isArray(eventsData.events) && eventsData.events.length > 0,
      `GET /api/v1/events returns ${eventsData.events?.length || 0} published events`
    );

    // 3. Event Details by Slug
    const eventSlug = eventsData.events?.[0]?.slug;
    if (eventSlug) {
      const slugRes = await fetch(`${baseUrl}/api/v1/events/${eventSlug}`);
      const slugData = await slugRes.json();
      assert(slugRes.status === 200 && slugData.event.slug === eventSlug, `GET /api/v1/events/:slug loads details for "${eventSlug}"`);
    }

    // 4. Public Team Members
    const teamRes = await fetch(`${baseUrl}/api/v1/team`);
    const teamData = await teamRes.json();
    assert(
      teamRes.status === 200 && teamData.team?.all?.length > 0,
      `GET /api/v1/team returns ${teamData.team?.all?.length || 0} verified committee members`
    );

    // 5. Public Activities & Achievements
    const actRes = await fetch(`${baseUrl}/api/v1/activities`);
    const actData = await actRes.json();
    assert(actRes.status === 200 && Array.isArray(actData.items), `GET /api/v1/activities returns ${actData.items?.length || 0} activity records`);

    // 6. Contact Form Submission
    const contactRes = await fetch(`${baseUrl}/api/v1/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Snehal Patil',
        email: 'snehal.patil@kbtcoe.org',
        subject: 'Inquiry regarding CodeRush 2026',
        message: 'Hello ACES committee, is there any team participation allowed for CodeRush?',
      }),
    });
    const contactData = await contactRes.json();
    assert(contactRes.status === 201 && contactData.success, 'POST /api/v1/contact successfully accepts student inquiry');

    // 7. Student Account Registration & Login Workflow
    const testEmail = `student_${Date.now()}@kbtcoe.org`;
    const regRes = await fetch(`${baseUrl}/api/v1/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: 'Test Student',
        email: testEmail,
        password: 'Password@123',
        department: 'Computer Engineering',
        academicYear: 'SE',
      }),
    });
    const regData = await regRes.json();
    assert(regRes.status === 201 && regData.token, 'POST /api/v1/auth/register creates student account with JWT token');

    const authToken = regData.token;

    // 8. Authenticated /auth/me
    const meRes = await fetch(`${baseUrl}/api/v1/auth/me`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    const meData = await meRes.json();
    assert(meRes.status === 200 && meData.user.email === testEmail, 'GET /api/v1/auth/me retrieves authenticated student profile');

    // 9. Membership Application Workflow
    const appRes = await fetch(`${baseUrl}/api/v1/applications`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        fullName: 'Test Student',
        email: testEmail,
        department: 'Computer Engineering',
        academicYear: 'SE',
        prnOrRoll: '72345678',
        areasOfInterest: ['Data Structures & Algorithms', 'Web & Full-Stack Development'],
        reasonForJoining: 'I want to build real software applications and actively coordinate departmental events with ACES.',
      }),
    });
    const appData = await appRes.json();
    assert(appRes.status === 201 && appData.application.status === 'PENDING', 'POST /api/v1/applications submits membership application with PENDING status');

    // 10. Duplicate Application Prevention
    const dupAppRes = await fetch(`${baseUrl}/api/v1/applications`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        fullName: 'Test Student',
        email: testEmail,
        department: 'Computer Engineering',
        academicYear: 'SE',
        areasOfInterest: ['Artificial Intelligence & ML'],
        reasonForJoining: 'Second attempt to join the departmental club.',
      }),
    });
    assert(dupAppRes.status === 409, 'Duplicate membership application is safely rejected (409 Conflict)');

    // 11. Event Registration Workflow
    const targetEvent = eventsData.events?.[0];
    if (targetEvent) {
      const registerRes = await fetch(`${baseUrl}/api/v1/registrations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          eventId: targetEvent._id,
          academicYear: 'SE',
          notes: 'Looking forward to the competition',
        }),
      });
      const registerData = await registerRes.json();
      assert(registerRes.status === 201 && registerData.registration, `POST /api/v1/registrations registers student for "${targetEvent.title}"`);

      // 12. Duplicate Event Registration Prevention
      const dupRegRes = await fetch(`${baseUrl}/api/v1/registrations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          eventId: targetEvent._id,
          academicYear: 'SE',
        }),
      });
      assert(dupRegRes.status === 409, 'Duplicate event registration is safely blocked (409 Conflict)');
    }

    // 13. Security: Unauthorized Admin Access Prevention
    const unauthAdminRes = await fetch(`${baseUrl}/api/v1/admin/stats`, {
      headers: { Authorization: `Bearer ${authToken}` }, // Logged in as student member, NOT admin
    });
    assert(unauthAdminRes.status === 403, 'Member account is forbidden from accessing Admin endpoints (403 Forbidden)');

    // 14. Admin Authentication & Operations
    const adminLoginRes = await fetch(`${baseUrl}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'aces.kbtcoe@gmail.com',
        password: 'AcesAdmin@2026',
      }),
    });
    const adminLoginData = await adminLoginRes.json();
    assert(adminLoginRes.status === 200 && adminLoginData.user.role === 'ADMIN', 'Admin login succeeds with verified role: ADMIN');

    const adminToken = adminLoginData.token;

    // 15. Admin Stats Endpoint
    const adminStatsRes = await fetch(`${baseUrl}/api/v1/admin/stats`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const adminStatsData = await adminStatsRes.json();
    assert(adminStatsRes.status === 200 && adminStatsData.stats.totalUsers > 0, 'Admin successfully fetches live system analytics');

  } catch (err) {
    console.error('Test execution error:', err);
    failed++;
  } finally {
    server.close();
    console.log(`\n======================================================`);
    console.log(`🏁 TEST EXECUTION COMPLETE: ${passed} PASSED, ${failed} FAILED`);
    console.log(`======================================================\n`);
    process.exit(failed > 0 ? 1 : 0);
  }
};

runTests();
