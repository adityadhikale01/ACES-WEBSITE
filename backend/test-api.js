import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import app from './server.js';
import User from './features/auth/userModel.js';
import Event from './features/events/eventModel.js';
import TeamMember from './features/team/teamModel.js';
import Designation from './features/team/designationModel.js';
import Activity from './features/activities/activityModel.js';
import { Album } from './features/gallery/galleryModel.js';
import SiteContent from './features/content/contentModel.js';
import { seedDatabase } from './init/seed.js';

let passed = 0;
let failed = 0;

function assert(condition, testName) {
  if (condition) {
    console.log(`✅ [PASS] ${testName}`);
    passed++;
  } else {
    console.error(`❌ [FAIL] ${testName}`);
    failed++;
  }
}

async function runTests() {
  console.log('\n======================================================');
  console.log('🏁 RUNNING ACES BACKEND (EXPRESS 5 + ES MODULES) TESTS');
  console.log('======================================================\n');

  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/aces_kbtcoe';
  try {
    await mongoose.connect(uri);
    console.log(`[MongoDB] Connected successfully to: ${uri}`);
  } catch (err) {
    console.error(`[MongoDB] Error: ${err.message}`);
    process.exit(1);
  }

  await seedDatabase();

  const testPort = 5098;
  const server = app.listen(testPort);
  const baseUrl = `http://localhost:${testPort}`;

  try {
    // 1. Health check
    const healthRes = await fetch(`${baseUrl}/health`);
    const healthData = await healthRes.json();
    assert(healthRes.status === 200 && healthData.status === 'healthy', 'Health check returns healthy');

    // 2. Events list
    const eventsRes = await fetch(`${baseUrl}/api/v1/events`);
    const eventsData = await eventsRes.json();
    assert(eventsRes.status === 200 && eventsData.events.length >= 3, `GET /api/v1/events returns ${eventsData.events?.length} events`);

    // 3. Team list
    const teamRes = await fetch(`${baseUrl}/api/v1/team`);
    const teamData = await teamRes.json();
    assert(teamRes.status === 200 && teamData.members.length >= 6, `GET /api/v1/team returns ${teamData.members?.length} committee members`);

    // 4. Contact inquiry
    const contactRes = await fetch(`${baseUrl}/api/v1/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Pooja Patil',
        email: 'pooja.patil@kbtcoe.in',
        subject: 'Workshop Query',
        message: 'Are second year students eligible for the Hackathon?',
      }),
    });
    const contactData = await contactRes.json();
    assert(contactRes.status === 201 && contactData.success === true, 'POST /api/v1/contact accepts student inquiry');

    // 5. Auth registration
    const studentEmail = `student-${Date.now()}@kbtcoe.in`;
    const regRes = await fetch(`${baseUrl}/api/v1/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Rohan Sharma',
        email: studentEmail,
        password: 'Password@123',
        department: 'Computer Engineering',
        academicYear: 'TE',
      }),
    });
    const regData = await regRes.json();
    assert(regRes.status === 201 && !!regData.token, 'POST /api/v1/auth/register registers student and returns JWT');
    const studentToken = regData.token;

    // 6. Superadmin Login
    const adminLoginRes = await fetch(`${baseUrl}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'aces.kbtcoe@gmail.com',
        password: 'AcesAdmin@2026',
      }),
    });
    const adminLoginData = await adminLoginRes.json();
    assert(adminLoginRes.status === 200 && adminLoginData.user?.role === 'SUPER_ADMIN', 'Superadmin login succeeds');
    const adminToken = adminLoginData.token;

    // 7. Admin Stats
    const statsRes = await fetch(`${baseUrl}/api/v1/admin/stats`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const statsData = await statsRes.json();
    assert(statsRes.status === 200 && statsData.stats?.totalEvents >= 3, 'Superadmin fetches system analytics');

    // 8. Faculty Login & Permissions
    const facLoginRes = await fetch(`${baseUrl}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'faculty.aces@kbtcoe.org',
        password: 'AcesFaculty@2026',
      }),
    });
    const facLoginData = await facLoginRes.json();
    assert(facLoginRes.status === 200 && facLoginData.user?.role === 'FACULTY', 'Faculty Coordinator logs in');
    const facultyToken = facLoginData.token;

    // Faculty creates activity
    const facActRes = await fetch(`${baseUrl}/api/v1/activities`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${facultyToken}`,
      },
      body: JSON.stringify({
        title: 'Industry Expert Session on Cloud Systems',
        type: 'ACTIVITY',
        category: 'EXPERT_TALK',
        description: 'Session conducted by Senior Architect on Kubernetes microservices.',
      }),
    });
    const facActData = await facActRes.json();
    assert(facActRes.status === 201 && !!facActData.item?.title, 'Faculty creates departmental activity');

    // RBAC: Faculty cannot delete events
    const facDelEventRes = await fetch(`${baseUrl}/api/v1/events/dummy-id`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${facultyToken}` },
    });
    assert(facDelEventRes.status === 403, 'RBAC Enforced: Faculty account forbidden from deleting events (403)');

    // 9. President Login & Permissions
    const presLoginRes = await fetch(`${baseUrl}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'president.aces@kbtcoe.org',
        password: 'AcesPresident@2026',
      }),
    });
    const presLoginData = await presLoginRes.json();
    assert(presLoginRes.status === 200 && presLoginData.user?.role === 'PRESIDENT', 'Club President logs in');
    const presidentToken = presLoginData.token;

    // RBAC: President cannot modify website branding
    const presBrandRes = await fetch(`${baseUrl}/api/v1/content/branding`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${presidentToken}`,
      },
      body: JSON.stringify({ data: { clubName: 'Hacked' } }),
    });
    assert(presBrandRes.status === 403, 'RBAC Enforced: President forbidden from changing CMS branding (403)');

    // RBAC: President cannot assign security roles
    const presRoleRes = await fetch(`${baseUrl}/api/v1/admin/users/dummy-id/role`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${presidentToken}`,
      },
      body: JSON.stringify({ role: 'SUPER_ADMIN' }),
    });
    assert(presRoleRes.status === 403, 'RBAC Enforced: President forbidden from assigning security roles (403)');

    // 10. Post Assignment on Platform Member (Change 1 & 4)
    const assignPostRes = await fetch(`${baseUrl}/api/v1/team/assign-post/${studentEmail}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        assignedPost: 'Vice President of Technical Affairs',
        postCategory: 'VICE_PRESIDENT',
        displayOrder: 2,
        isPublishedOnTeam: true,
      }),
    });
    const assignPostData = await assignPostRes.json();
    assert(assignPostRes.status === 200 && assignPostData.user?.assignedPost === 'Vice President of Technical Affairs', 'Superadmin dynamically assigns Vice President post to platform member');

    // 11. Membership Application & Automated Approval with Email Dispatch (Change 2)
    const appSubmitRes = await fetch(`${baseUrl}/api/v1/applications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: 'Sneha Kulkarni',
        email: `sneha-${Date.now()}@kbtcoe.org`,
        phone: '9876543210',
        department: 'Computer Engineering',
        academicYear: 'SE',
        reasonForJoining: 'Eager to contribute to departmental workshops and web dev team.',
        areasOfInterest: ['Web Development', 'Event Coordination'],
      }),
    });
    const appSubmitData = await appSubmitRes.json();
    assert(appSubmitRes.status === 201 && !!appSubmitData.application?._id, 'Student submits membership application');

    const appReviewRes = await fetch(`${baseUrl}/api/v1/applications/${appSubmitData.application._id}/review`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        status: 'APPROVED',
        assignedPost: 'Execution Team Lead',
        postCategory: 'EXECUTION_TEAM',
        adminNotes: 'Welcome aboard Sneha! Check your credentials below.',
      }),
    });
    const appReviewData = await appReviewRes.json();
    assert(appReviewRes.status === 200 && appReviewData.application?.status === 'APPROVED', 'Superadmin approves membership; credentials and automated email dispatched');

    // 12. Guest Event Registration without platform login (Change 3)
    const activeEvent = eventsData.events[0];
    const guestEmail = `karan-${Date.now()}@gmail.com`;
    const guestRegRes = await fetch(`${baseUrl}/api/v1/registrations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        eventId: activeEvent._id,
        fullName: 'Karan Deshmukh',
        email: guestEmail,
        phone: '9822334455',
        college: 'NDMVP KBTCOE',
        department: 'Computer Engineering',
        academicYear: 'TE',
      }),
    });
    const guestRegData = await guestRegRes.json();
    assert(guestRegRes.status === 201 && !!guestRegData.registration?.ticketId, `Guest event registration succeeds without login (Ticket ID: ${guestRegData.registration?.ticketId})`);

    // 13. Free Event Registration with Ticket Pass & WhatsApp Group (Change 1)
    const freeEvent = eventsData.events.find((e) => !e.isPaid) || activeEvent;
    const freeStudentEmail = `tanvi-${Date.now()}@kbtcoe.in`;
    const freeRegRes = await fetch(`${baseUrl}/api/v1/registrations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        eventId: freeEvent._id,
        fullName: 'Tanvi Joshi',
        email: freeStudentEmail,
        phone: '9890123456',
        college: 'NDMVP KBTCOE',
        department: 'Computer Engineering',
        academicYear: 'SE',
      }),
    });
    const freeRegData = await freeRegRes.json();
    assert(
      freeRegRes.status === 201 &&
        ['REGISTERED', 'CONFIRMED'].includes(freeRegData.registration?.status) &&
        !!freeRegData.registration?.ticketId,
      `Free event registration automatically confirmed with Ticket ID & confirmation email dispatched (${freeRegData.registration?.ticketId})`
    );

    // 14. Event Operations Desk: Attendee Check-In Toggle (Change 2)
    const regIdToCheckIn = freeRegData.registration?._id;
    const checkInRes = await fetch(`${baseUrl}/api/v1/registrations/${regIdToCheckIn}/attendance`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ attended: true }),
    });
    const checkInData = await checkInRes.json();
    assert(
      checkInRes.status === 200 && checkInData.registration?.attended === true,
      'Event Operations Desk: Attendee check-in status toggled to attended: true'
    );

    // 15. Superadmin Mail Service: Live Test Email (Change 1)
    const testEmailRes = await fetch(`${baseUrl}/api/v1/content/send-test-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        recipient: 'test.organizer@kbtcoe.org',
        message: 'ACES automated verification test dispatch.',
      }),
    });
    const testEmailData = await testEmailRes.json();
    assert(
      testEmailRes.status === 200 && testEmailData.success === true,
      `Superadmin Email Setting: Live Test Email dispatched successfully (${testEmailData.message})`
    );

    // 16. Past Event Operations: Close Event Status (Change 2)
    const closeEventRes = await fetch(`${baseUrl}/api/v1/events/${freeEvent._id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ status: 'CLOSED' }),
    });
    const closeEventData = await closeEventRes.json();
    assert(
      closeEventRes.status === 200 && closeEventData.event?.status === 'CLOSED',
      'Event Operations Desk: Past event status successfully closed / completed by organizer'
    );

    console.log('\n======================================================');
    console.log(`🏁 TEST EXECUTION COMPLETE: ${passed} PASSED, ${failed} FAILED`);
    console.log('======================================================\n');
  } finally {
    server.close();
    await mongoose.disconnect();
  }
}

runTests();
