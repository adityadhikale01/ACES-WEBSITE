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

    // 16. Designation Management (Dynamic Roles)
    const desgRes = await fetch(`${baseUrl}/api/v1/designations`);
    const desgData = await desgRes.json();
    assert(desgRes.status === 200 && Array.isArray(desgData.designations), `GET /api/v1/designations returns ${desgData.designations?.length || 0} active designations`);

    const desgTitle = `Lead Cloud Architect ${Date.now()}`;
    const newDesgRes = await fetch(`${baseUrl}/api/v1/designations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        title: desgTitle,
        tier: 'CORE_OFFICER',
        displayOrder: 15,
        description: 'Oversees departmental cloud infrastructure and deployments',
      }),
    });
    const newDesgData = await newDesgRes.json();
    assert(newDesgRes.status === 201 && newDesgData.designation?.title === desgTitle, 'Admin creates a configurable club designation');

    // 17. Paid Event Registration & Manual Payment Verification Workflow
    const paidEvent = eventsData.events?.find((e) => e.isPaid) || eventsData.events?.[0];
    if (paidEvent) {
      // Ensure it has isPaid: true for testing if needed
      if (!paidEvent.isPaid) {
        await Event.findByIdAndUpdate(paidEvent._id, {
          isPaid: true,
          fee: 25000,
          paymentUpiId: 'aceskbtcoe@okaxis',
          paymentInstructions: 'Pay Rs 250 via GPay/PhonePe to aceskbtcoe@okaxis',
        });
      }

      // Register second student for paid event
      const student2Email = `student2_${Date.now()}@kbtcoe.org`;
      const reg2Res = await fetch(`${baseUrl}/api/v1/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: 'Ananya Sharma',
          email: student2Email,
          password: 'Password@123',
          department: 'Computer Engineering',
          academicYear: 'TE',
        }),
      });
      const reg2Data = await reg2Res.json();
      const student2Token = reg2Data.token;

      const paidRegRes = await fetch(`${baseUrl}/api/v1/registrations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${student2Token}`,
        },
        body: JSON.stringify({
          eventId: paidEvent._id,
          academicYear: 'TE',
          notes: 'Team Lead',
        }),
      });
      const paidRegData = await paidRegRes.json();
      assert(
        paidRegRes.status === 201 &&
          paidRegData.registration?.paymentStatus === 'AWAITING_PAYMENT' &&
          paidRegData.registration?.status === 'WAITLISTED',
        'Paid event registration sets status to WAITLISTED with paymentStatus AWAITING_PAYMENT'
      );

      const registrationId = paidRegData.registration._id;

      // 18. Submit Payment Proof with UTR & Screenshot
      const mockImageBuffer = Buffer.from(
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
        'base64'
      );
      const formData = new FormData();
      formData.append('registrationId', registrationId);
      const testUtr = `UTR${Date.now()}`;
      formData.append('utrReference', testUtr);
      formData.append('screenshot', new Blob([mockImageBuffer], { type: 'image/png' }), 'receipt.png');

      const submitProofRes = await fetch(`${baseUrl}/api/v1/payments/submit-proof`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${student2Token}`,
        },
        body: formData,
      });
      const submitProofData = await submitProofRes.json();
      assert(
        submitProofRes.status === 201 && submitProofData.submission?.status === 'PROOF_SUBMITTED',
        'Student submits UTR reference and payment screenshot successfully'
      );

      const submissionId = submitProofData.submission?._id;

      // 19. IDOR Security: Third-party student CANNOT view screenshot
      const idorRes = await fetch(`${baseUrl}/api/v1/payments/screenshot/${submissionId}`, {
        headers: { Authorization: `Bearer ${authToken}` }, // Different student
      });
      assert(idorRes.status === 403, 'IDOR Protection: Unauthorized user is denied access to payment receipt (403 Forbidden)');

      // 20. Student owner CAN view screenshot
      const ownerReceiptRes = await fetch(`${baseUrl}/api/v1/payments/screenshot/${submissionId}`, {
        headers: { Authorization: `Bearer ${student2Token}` },
      });
      assert(ownerReceiptRes.status === 200, 'Student owner can securely retrieve payment proof receipt stream');

      // 21. Admin Review & Verification
      const adminQueueRes = await fetch(`${baseUrl}/api/v1/payments/admin/all`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      const adminQueueData = await adminQueueRes.json();
      assert(
        adminQueueRes.status === 200 && Array.isArray(adminQueueData.submissions) && adminQueueData.submissions.length > 0,
        'Admin lists pending payment verification queue'
      );

      const verifyRes = await fetch(`${baseUrl}/api/v1/payments/admin/${submissionId}/verify`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          status: 'VERIFIED',
          adminNotes: 'Transaction verified with bank statement',
        }),
      });
      const verifyData = await verifyRes.json();
      assert(
        verifyRes.status === 200 &&
          verifyData.submission?.status === 'VERIFIED' &&
          verifyData.registration?.paymentStatus === 'VERIFIED' &&
          verifyData.registration?.status === 'REGISTERED',
        'Admin verification confirms payment and promotes registration to REGISTERED'
      );
    }

    // 22. Event Gallery Albums & Media
    const galleryRes = await fetch(`${baseUrl}/api/v1/gallery/albums`);
    const galleryData = await galleryRes.json();
    assert(
      galleryRes.status === 200 && Array.isArray(galleryData.albums) && galleryData.albums.length > 0,
      `GET /api/v1/gallery/albums returns ${galleryData.albums?.length || 0} completed event albums`
    );

    // 23. Admin Creates Completed Event Album
    const newAlbumRes = await fetch(`${baseUrl}/api/v1/gallery/albums`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        title: 'National Tech Symposium 2026',
        description: 'Memories and key moments from our annual flagship technical symposium.',
        eventDate: '2026-03-20',
        academicYear: '2025-26',
        category: 'SYMPOSIUM',
        isPublished: true,
      }),
    });
    const newAlbumData = await newAlbumRes.json();
    assert(newAlbumRes.status === 201 && newAlbumData.album?.title === 'National Tech Symposium 2026', 'Admin successfully creates completed event album');

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
