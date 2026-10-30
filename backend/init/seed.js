import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../features/auth/userModel.js';
import Event from '../features/events/eventModel.js';
import TeamMember from '../features/team/teamModel.js';
import Designation from '../features/team/designationModel.js';
import { Album, MediaItem } from '../features/gallery/galleryModel.js';
import Activity from '../features/activities/activityModel.js';
import SiteContent from '../features/content/contentModel.js';

export const seedDatabase = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/aces_kbtcoe';
  console.log(`[Seed] Connecting to MongoDB: ${uri}...`);
  if (mongoose.connection.readyState !== 1) {
    await mongoose.connect(uri);
  }

  // Ensure legacy index is dropped for guest registrations
  try {
    await mongoose.connection.collection('registrations').dropIndex('eventId_1_userId_1');
  } catch (e) {}

  console.log('[Seed] Seeding all 17 authentic ACES Committee members, events, gallery, and administrative accounts...');

  // 1. Seed Real-Life Role-Based Administrative Accounts
  const adminPasswordHash = await bcrypt.hash('AcesAdmin@2026', 10);
  const facultyPasswordHash = await bcrypt.hash('AcesFaculty@2026', 10);
  const presidentPasswordHash = await bcrypt.hash('AcesPresident@2026', 10);

  const superAdmin = await User.findOneAndUpdate(
    { email: 'aces.kbtcoe@gmail.com' },
    {
      name: 'ACES Superadmin & Lead Coordinator',
      fullName: 'ACES Superadmin & Lead Coordinator',
      email: 'aces.kbtcoe@gmail.com',
      passwordHash: adminPasswordHash,
      role: 'SUPER_ADMIN',
      department: 'Computer Engineering',
      academicYear: 'FACULTY',
      phone: '+91 253 2571439',
      isApprovedMember: true,
      isActive: true,
    },
    { upsert: true, new: true }
  );

  await User.findOneAndUpdate(
    { email: 'faculty.aces@kbtcoe.org' },
    {
      name: 'Prof. Faculty Coordinator',
      fullName: 'Prof. Faculty Coordinator',
      email: 'faculty.aces@kbtcoe.org',
      passwordHash: facultyPasswordHash,
      role: 'FACULTY',
      department: 'Computer Engineering',
      academicYear: 'FACULTY',
      phone: '+91 253 2571439',
      isApprovedMember: true,
      isActive: true,
    },
    { upsert: true }
  );

  await User.findOneAndUpdate(
    { email: 'president.aces@kbtcoe.org' },
    {
      name: 'Aditya Dhikale (Club President)',
      fullName: 'Aditya Dhikale (Club President)',
      email: 'president.aces@kbtcoe.org',
      passwordHash: presidentPasswordHash,
      role: 'PRESIDENT',
      department: 'Computer Engineering',
      academicYear: 'BE',
      phone: '+91 98765 43210',
      isApprovedMember: true,
      isActive: true,
    },
    { upsert: true }
  );

  // 2. Official Designations
  const designationsData = [
    { title: 'Faculty Coordinator', tier: 'FACULTY', category: 'FACULTY', displayOrder: 1 },
    { title: 'Club President', tier: 'PRESIDENT', category: 'LEADERSHIP', displayOrder: 2 },
    { title: 'Vice President', tier: 'VICE_PRESIDENT', category: 'LEADERSHIP', displayOrder: 3 },
    { title: 'Treasurer', tier: 'EXECUTIVE', category: 'LEADERSHIP', displayOrder: 4 },
    { title: 'Event Coordinator', tier: 'EXECUTIVE', category: 'OPERATIONS', displayOrder: 5 },
    { title: 'Technical Lead', tier: 'EXECUTIVE', category: 'TECHNICAL', displayOrder: 6 },
    { title: 'Publicity & Media Head', tier: 'EXECUTIVE', category: 'CREATIVE', displayOrder: 7 },
    { title: 'Committee Member', tier: 'COMMITTEE', category: 'COMMITTEE', displayOrder: 8 },
  ];

  for (const d of designationsData) {
    await Designation.findOneAndUpdate({ title: d.title }, d, { upsert: true });
  }

  // 3. All 17 Verified Committee Members (Real ACES KBTCOE Committee 2026-27)
  const teamData = [
    {
      name: 'Aditya Dhikale',
      role: 'PRESIDENT',
      designation: 'President',
      tier: 'PRESIDENT',
      category: 'LEADERSHIP',
      department: 'Computer Engineering',
      academicYear: 'BE',
      bio: 'Leading ACES 2026-27 to build a vibrant culture of learning, building, and innovation within the department.',
      photoUrl: '/assets/members/President.jpeg',
      linkedinUrl: 'https://linkedin.com',
      githubUrl: 'https://github.com',
      displayOrder: 1,
      isActive: true,
      isPublished: true,
    },
    {
      name: 'Sammpana Kasar',
      role: 'VICE PRESIDENT',
      designation: 'Vice President',
      tier: 'VICE_PRESIDENT',
      category: 'LEADERSHIP',
      department: 'Computer Engineering',
      academicYear: 'BE',
      bio: 'Spearheading departmental initiatives, student mentorship, and strategic community outreach.',
      photoUrl: '/assets/members/VicePresident.png',
      linkedinUrl: 'https://linkedin.com',
      displayOrder: 2,
      isActive: true,
      isPublished: true,
    },
    {
      name: 'Ayush Talekar',
      role: 'TREASURER',
      designation: 'Treasurer',
      tier: 'EXECUTIVE',
      category: 'LEADERSHIP',
      department: 'Computer Engineering',
      academicYear: 'TE',
      bio: 'Managing club finances, budgeting for flagship events, and resource management.',
      photoUrl: '/assets/members/AyushTalekar(Treasurer).jpg',
      displayOrder: 3,
      isActive: true,
      isPublished: true,
    },
    {
      name: 'Khushi Mansuri',
      role: 'EVENT COORDINATOR',
      designation: 'Event Coordinator',
      tier: 'EXECUTIVE',
      category: 'OPERATIONS',
      department: 'Computer Engineering',
      academicYear: 'TE',
      bio: 'Coordinating workshops, competitions, and technical logistics across the academic year.',
      photoUrl: '/assets/members/KhushiMansuri(Event Coordinator).png',
      displayOrder: 4,
      isActive: true,
      isPublished: true,
    },
    {
      name: 'Yash Patil',
      role: 'EVENT COORDINATOR',
      designation: 'Event Coordinator',
      tier: 'EXECUTIVE',
      category: 'OPERATIONS',
      department: 'Computer Engineering',
      academicYear: 'TE',
      bio: 'Organizing seamless technical sessions, scheduling, and on-ground execution.',
      photoUrl: '/assets/members/yash_Patil(Event Coordinator).jpg',
      displayOrder: 5,
      isActive: true,
      isPublished: true,
    },
    {
      name: 'Arjun Patil',
      role: 'COMMITTEE MEMBER',
      designation: 'Committee Member',
      tier: 'COMMITTEE',
      category: 'COMMITTEE',
      department: 'Computer Engineering',
      academicYear: 'TE',
      photoUrl: '/assets/members/arjun_patil.jpg',
      displayOrder: 6,
      isActive: true,
      isPublished: true,
    },
    {
      name: 'Atharva Vispute',
      role: 'COMMITTEE MEMBER',
      designation: 'Committee Member',
      tier: 'COMMITTEE',
      category: 'COMMITTEE',
      department: 'Computer Engineering',
      academicYear: 'SE',
      photoUrl: '/assets/members/Atharva_vispute.png',
      displayOrder: 7,
      isActive: true,
      isPublished: true,
    },
    {
      name: 'Apurva Rahane',
      role: 'COMMITTEE MEMBER',
      designation: 'Committee Member',
      tier: 'COMMITTEE',
      category: 'COMMITTEE',
      department: 'Computer Engineering',
      academicYear: 'SE',
      photoUrl: '/assets/members/Apurva_Rahane.png',
      displayOrder: 8,
      isActive: true,
      isPublished: true,
    },
    {
      name: 'Ronit Raheja',
      role: 'COMMITTEE MEMBER',
      designation: 'Committee Member',
      tier: 'COMMITTEE',
      category: 'COMMITTEE',
      department: 'Computer Engineering',
      academicYear: 'SE',
      photoUrl: '/assets/members/ronitraheja.jpeg',
      displayOrder: 9,
      isActive: true,
      isPublished: true,
    },
    {
      name: 'Purva Sonawane',
      role: 'COMMITTEE MEMBER',
      designation: 'Committee Member',
      tier: 'COMMITTEE',
      category: 'COMMITTEE',
      department: 'Computer Engineering',
      academicYear: 'SE',
      photoUrl: '/assets/members/purva sonawane.png',
      displayOrder: 10,
      isActive: true,
      isPublished: true,
    },
    {
      name: 'Sarthak Patil',
      role: 'COMMITTEE MEMBER',
      designation: 'Committee Member',
      tier: 'COMMITTEE',
      category: 'COMMITTEE',
      department: 'Computer Engineering',
      academicYear: 'SE',
      photoUrl: '/assets/members/Sarthak Patil.jpg',
      displayOrder: 11,
      isActive: true,
      isPublished: true,
    },
    {
      name: 'Sanyukti Gangurde',
      role: 'COMMITTEE MEMBER',
      designation: 'Committee Member',
      tier: 'COMMITTEE',
      category: 'COMMITTEE',
      department: 'Computer Engineering',
      academicYear: 'SE',
      photoUrl: '/assets/members/sanyukti gangurde.png',
      displayOrder: 12,
      isActive: true,
      isPublished: true,
    },
    {
      name: 'Mrunal Amrutkar',
      role: 'COMMITTEE MEMBER',
      designation: 'Committee Member',
      tier: 'COMMITTEE',
      category: 'COMMITTEE',
      department: 'Computer Engineering',
      academicYear: 'SE',
      photoUrl: '/assets/members/Mrunal Amrutkar.jpg',
      displayOrder: 13,
      isActive: true,
      isPublished: true,
    },
    {
      name: 'Mrunal Thete',
      role: 'COMMITTEE MEMBER',
      designation: 'Committee Member',
      tier: 'COMMITTEE',
      category: 'COMMITTEE',
      department: 'Computer Engineering',
      academicYear: 'SE',
      photoUrl: '/assets/members/Mrunal Thete.jpg',
      displayOrder: 14,
      isActive: true,
      isPublished: true,
    },
    {
      name: 'Nirali Shah',
      role: 'COMMITTEE MEMBER',
      designation: 'Committee Member',
      tier: 'COMMITTEE',
      category: 'COMMITTEE',
      department: 'Computer Engineering',
      academicYear: 'SE',
      photoUrl: '/assets/members/Nirali Shah.jpeg',
      displayOrder: 15,
      isActive: true,
      isPublished: true,
    },
    {
      name: 'Shraddha Sonar',
      role: 'COMMITTEE MEMBER',
      designation: 'Committee Member',
      tier: 'COMMITTEE',
      category: 'COMMITTEE',
      department: 'Computer Engineering',
      academicYear: 'SE',
      photoUrl: '/assets/members/sharadhha sonar_Drive.jpg',
      displayOrder: 16,
      isActive: true,
      isPublished: true,
    },
    {
      name: 'Jiya Shah',
      role: 'COMMITTEE MEMBER',
      designation: 'Committee Member',
      tier: 'COMMITTEE',
      category: 'COMMITTEE',
      department: 'Computer Engineering',
      academicYear: 'SE',
      photoUrl: '/assets/members/JIYA SHAH.jpg',
      displayOrder: 17,
      isActive: true,
      isPublished: true,
    },
  ];

  const defaultMemberPasswordHash = await bcrypt.hash('AcesMember@2026', 10);
  for (const m of teamData) {
    const slugName = m.name.toLowerCase().replace(/[^a-z0-9]/g, '.');
    const memberEmail = m.email || `${slugName}@kbtcoe.org`;

    const cat =
      m.tier === 'PRESIDENT'
        ? 'PRESIDENT'
        : m.tier === 'VICE_PRESIDENT'
        ? 'VICE_PRESIDENT'
        : m.tier === 'EXECUTIVE'
        ? 'EXECUTION_TEAM'
        : 'MEMBER';

    await User.findOneAndUpdate(
      { email: memberEmail },
      {
        name: m.name,
        fullName: m.name,
        email: memberEmail,
        passwordHash: defaultMemberPasswordHash,
        role: ['PRESIDENT', 'VICE_PRESIDENT'].includes(m.tier) ? m.tier : 'MEMBER',
        department: m.department || 'Computer Engineering',
        academicYear: m.academicYear || 'TE',
        photoUrl: m.photoUrl,
        bio: m.bio || '',
        linkedinUrl: m.linkedinUrl || '',
        githubUrl: m.githubUrl || '',
        assignedPost: m.designation || m.role,
        postCategory: cat,
        displayOrder: m.displayOrder || 100,
        isApprovedMember: true,
        isActive: true,
        isPublishedOnTeam: true,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    await TeamMember.findOneAndUpdate(
      { name: m.name },
      { ...m, email: memberEmail, isCurrent: true, isActive: true, isPublished: true },
      { upsert: true, setDefaultsOnInsert: true }
    );
  }

  // 4. Authentic Departmental Events
  const eventsData = [
    {
      title: 'TECH TANK - EQUITY WARS',
      slug: 'tech-tank-equity-wars',
      subtitle: 'The Departmental Startup Pitch & Valuation Arena',
      shortDescription: 'Pitch your boldest startup idea, defend your tech stack and valuation, and compete against the sharpest minds in the Computer Engineering department.',
      description: 'Tech Tank - Equity Wars challenges student teams to engineer software prototypes addressing real problems and present to an expert jury in front of guest judges.',
      category: 'FLAGSHIP',
      posterUrl: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1200&q=80',
      venue: 'Seminar Hall, KBTCOE',
      isOnline: false,
      startDate: new Date('2026-11-14T10:00:00Z'),
      eventDate: new Date('2026-11-14T10:00:00Z'),
      timeString: '10:00 AM - 4:00 PM',
      registrationDeadline: new Date('2026-11-12T23:59:59Z'),
      capacity: 120,
      maxCapacity: 120,
      registeredCount: 42,
      registrationCount: 42,
      eligibility: 'OPEN_TO_ALL',
      status: 'PUBLISHED',
      isFeatured: true,
      isPaid: false,
      fee: 0,
      feeAmountInPaise: 0,
      organizerInfo: 'ACES KBTCOE Flagship Committee',
      createdBy: superAdmin._id,
    },
    {
      title: 'CODERUSH 2026',
      slug: 'coderush-2026',
      subtitle: 'Speed, DSA & Algorithmic Problem Solving',
      shortDescription: 'A high-energy competitive programming challenge focused on Data Structures, logic, algorithmic optimization, and real-world edge cases.',
      description: 'Test your coding endurance in a 3-hour speed programming challenge across arrays, trees, dynamic programming, and graphs.',
      category: 'CODING',
      posterUrl: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=1200&q=80',
      venue: 'Computer Lab 01 & 02, Department of Computer Engineering',
      isOnline: false,
      startDate: new Date('2026-11-21T11:00:00Z'),
      eventDate: new Date('2026-11-21T11:00:00Z'),
      timeString: '11:00 AM - 2:00 PM',
      registrationDeadline: new Date('2026-11-20T18:00:00Z'),
      capacity: 80,
      maxCapacity: 80,
      registeredCount: 65,
      registrationCount: 65,
      eligibility: 'OPEN_TO_ALL',
      status: 'PUBLISHED',
      isFeatured: true,
      isPaid: false,
      fee: 0,
      feeAmountInPaise: 0,
      organizerInfo: 'ACES Technical Domain',
      createdBy: superAdmin._id,
    },
    {
      title: 'BUILD WITH AI & AGENTS',
      slug: 'build-with-ai-agents',
      subtitle: 'Hands-on Generative AI and Autonomous Coding',
      shortDescription: 'Explore modern LLMs, function-calling agents, and real-time AI toolsets for production-ready engineering.',
      description: 'Hands-on weekend masterclass covering modern generative models, embeddings, RAG pipelines, and building autonomous agent tools.',
      category: 'WORKSHOP',
      posterUrl: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=1200&q=80',
      venue: 'Auditorium, KBTCOE',
      isOnline: false,
      startDate: new Date('2026-12-05T14:00:00Z'),
      eventDate: new Date('2026-12-05T14:00:00Z'),
      timeString: '2:00 PM - 5:30 PM',
      registrationDeadline: new Date('2026-12-04T20:00:00Z'),
      capacity: 150,
      maxCapacity: 150,
      registeredCount: 110,
      registrationCount: 110,
      eligibility: 'OPEN_TO_ALL',
      status: 'PUBLISHED',
      isFeatured: true,
      isPaid: false,
      fee: 0,
      feeAmountInPaise: 0,
      organizerInfo: 'ACES AI & Web Head',
      createdBy: superAdmin._id,
    },
    {
      title: 'TECHFEST 2027 HACKATHON',
      slug: 'techfest-2027-hackathon',
      subtitle: '24-Hour Product Sprint & Cash Prize Arena',
      shortDescription: 'The flagship 24-hour departmental hackathon. Build innovative software prototypes and compete for verified prizes.',
      description: 'A 24-hour hackathon where student teams design and ship high-impact technology solutions evaluated by alumni and industry mentors.',
      category: 'FLAGSHIP',
      posterUrl: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80',
      venue: 'KBTCOE Central Campus, Nashik',
      isOnline: false,
      startDate: new Date('2027-02-20T09:00:00Z'),
      eventDate: new Date('2027-02-20T09:00:00Z'),
      timeString: '9:00 AM Onwards (24-Hour Hack)',
      registrationDeadline: new Date('2027-02-18T23:59:00Z'),
      capacity: 100,
      maxCapacity: 100,
      registeredCount: 28,
      registrationCount: 28,
      eligibility: 'OPEN_TO_ALL',
      status: 'PUBLISHED',
      isFeatured: true,
      isPaid: true,
      fee: 20000, // Rs. 200 (in paise)
      feeAmountInPaise: 20000,
      paymentInstructions: 'Pay registration fee of Rs. 200 per team via official departmental UPI. Enter the 12-digit UTR and upload the payment receipt.',
      paymentUpiId: 'aces.kbtcoe@upi',
      upiId: 'aces.kbtcoe@upi',
      refundPolicy: 'Refunds permitted if cancellation is requested 48 hours prior to hackathon launch.',
      organizerInfo: 'ACES Flagship Hackathon Team',
      createdBy: superAdmin._id,
    },
  ];

  for (const e of eventsData) {
    await Event.findOneAndUpdate({ slug: e.slug }, e, { upsert: true });
  }

  // 5. Concluded Event Gallery Album (Kachurli Ashram Shala Event)
  const albumData = {
    title: 'Kachurli Ashram Shala Social & Educational Outreach',
    slug: 'kachurli-ashram-shala-social-outreach',
    eventDate: new Date('2026-09-23'),
    description: 'ACES KBTCOE students and faculty conducted an inspiring community outreach initiative at Kachurli Ashram Shala, conducting computer fundamentals workshops, educational sessions, and sharing knowledge.',
    category: 'SOCIAL_INITIATIVE',
    coverMediaUrl: '/assets/events/Kachurli_Ashram_Shala_Event.jpg',
    coverMediaType: 'IMAGE',
    media: [
      {
        url: '/assets/events/Kachurli_Ashram_Shala_Event.jpg',
        mediaType: 'IMAGE',
        caption: 'ACES team conducting interactive sessions with students at Kachurli Ashram Shala.',
        altText: 'Kachurli Ashram Shala Outreach Session 1',
        displayOrder: 1,
        isFeatured: true,
      },
      {
        url: '/assets/events/Kachurli_Ashram_Shala_Event.2.jpg',
        mediaType: 'IMAGE',
        caption: 'Student volunteers and departmental faculty engaging in hands-on learning activities.',
        altText: 'Kachurli Ashram Shala Outreach Session 2',
        displayOrder: 2,
        isFeatured: true,
      },
    ],
    isPublished: true,
    displayOrder: 1,
    mediaCount: 2,
  };

  const createdAlbum = await Album.findOneAndUpdate({ title: albumData.title }, albumData, { upsert: true, new: true });
  for (const m of albumData.media) {
    await MediaItem.findOneAndUpdate(
      { albumId: createdAlbum._id, url: m.url },
      { albumId: createdAlbum._id, ...m },
      { upsert: true }
    );
  }

  // 6. Activities & Achievements
  const activitiesData = [
    {
      title: 'Social Outreach at Kachurli Ashram Shala',
      slug: 'kachurli-ashram-shala-visit',
      type: 'ACTIVITY',
      category: 'SOCIAL_INITIATIVE',
      date: new Date('2026-09-12'),
      description: 'ACES committee members organized a digital literacy workshop and stationery distribution drive for students at Kachurli Ashram Shala.',
      imageUrl: '/assets/events/Kachurli_Ashram_Shala_Event.jpg',
      impactSummary: 'Over 120 students benefited from digital literacy introduction.',
      tags: ['Social Impact', 'Community Outreach'],
    },
    {
      title: 'National Smart India Hackathon Finalists',
      slug: 'sih-national-finalists-2026',
      type: 'ACHIEVEMENT',
      category: 'HACKATHON_WIN',
      date: new Date('2026-08-20'),
      description: 'Two teams mentored under ACES departmental circles secured finalist positions in the national finals of Smart India Hackathon.',
      imageUrl: '/assets/aces-team.jpg',
      impactSummary: 'Recognized at national level by Ministry of Education.',
      tags: ['SIH', 'Hackathon Winner', 'National'],
    },
    {
      title: 'Expert Session on Cloud Distributed Systems',
      slug: 'expert-session-cloud-systems',
      type: 'ACTIVITY',
      category: 'EXPERT_TALK',
      date: new Date('2026-07-15'),
      description: 'Industry technical talk by Senior Staff Cloud Architect covering Kubernetes container orchestration and production microservices.',
      imageUrl: '/assets/aces-team.jpg',
      impactSummary: 'Over 180 Computer Engineering students attended.',
      tags: ['Cloud', 'Kubernetes', 'Expert Talk'],
    },
  ];

  for (const a of activitiesData) {
    await Activity.findOneAndUpdate({ slug: a.slug }, a, { upsert: true });
  }

  // 7. Site Content CMS
  const siteContentKeys = ['about_info', 'club_stats', 'contact_details', 'payment_settings', 'branding'];
  for (const key of siteContentKeys) {
    let data = {};
    if (key === 'branding') {
      data = {
        groupPhotoUrl: '/assets/aces-team.jpg',
        logoUrl: '/assets/aces-logo.jpeg',
        clubName: 'ACES KBTCOE',
        fullName: "Association of Computer Engineering Students'",
        tagline: 'Where Ideas Meet Innovation.',
        department: 'Department of Computer Engineering',
        college: "MVPS's K.B.T. College of Engineering, Nashik",
        contactEmail: 'aces.kbtcoe@gmail.com',
        academicYear: '2026-27',
      };
    } else if (key === 'club_stats') {
      data = {
        totalMembers: '50+',
        eventsOrganized: '25+',
        studentParticipants: '2500+',
        activeYears: '10+',
      };
    } else if (key === 'payment_settings') {
      data = {
        upiId: 'aces.kbtcoe@upi',
        beneficiaryName: 'ACES KBTCOE Department Club',
        qrCodeUrl: '/assets/aces-logo.jpeg',
        instructions: 'Please pay the registration fee using any UPI app and enter the 12-digit UTR reference.',
      };
    } else if (key === 'contact_details') {
      data = {
        email: 'aces.kbtcoe@gmail.com',
        phone: '+91 253 2571439',
        address: "Department of Computer Engineering, MVPS's KBTCOE, Udoji Maratha Boarding Campus, Gangapur Road, Nashik - 422013, Maharashtra.",
      };
    } else if (key === 'about_info') {
      data = {
        vision: 'To build a community of computer engineering students who are technically strong, creatively curious, and equipped to lead modern technology domains.',
        mission: 'To organize hands-on technical workshops, competitive hackathons, industry sessions, and peer learning circles that bridge classroom curriculum with industry reality.',
      };
    }
    await SiteContent.findOneAndUpdate({ key }, { key, data }, { upsert: true });
  }

  console.log('✅ [Seed] Successfully seeded all authentic ACES data into MongoDB!');
};

if (process.argv[1]?.includes('seed.js')) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Seed error:', err);
      process.exit(1);
    });
}
