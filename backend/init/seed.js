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
  await mongoose.connect(uri);

  console.log('[Seed] Seeding administrative accounts & authentic ACES data...');

  // 1. Administrative Accounts
  const adminPasswordHash = await bcrypt.hash('AcesAdmin@2026', 10);
  const facultyPasswordHash = await bcrypt.hash('AcesFaculty@2026', 10);
  const presidentPasswordHash = await bcrypt.hash('AcesPresident@2026', 10);

  const superAdmin = await User.findOneAndUpdate(
    { email: 'aces.kbtcoe@gmail.com' },
    {
      name: 'ACES Superadmin',
      email: 'aces.kbtcoe@gmail.com',
      passwordHash: adminPasswordHash,
      role: 'SUPER_ADMIN',
      department: 'Computer Engineering',
      isActive: true,
    },
    { upsert: true, new: true }
  );

  await User.findOneAndUpdate(
    { email: 'faculty.aces@kbtcoe.org' },
    {
      name: 'Prof. Faculty Coordinator',
      email: 'faculty.aces@kbtcoe.org',
      passwordHash: facultyPasswordHash,
      role: 'FACULTY',
      department: 'Computer Engineering',
      isActive: true,
    },
    { upsert: true }
  );

  await User.findOneAndUpdate(
    { email: 'president.aces@kbtcoe.org' },
    {
      name: 'Aditya Dhikale (Club President)',
      email: 'president.aces@kbtcoe.org',
      passwordHash: presidentPasswordHash,
      role: 'PRESIDENT',
      department: 'Computer Engineering',
      isActive: true,
    },
    { upsert: true }
  );

  // 2. Official Designations
  const designationsData = [
    { title: 'Faculty Coordinator', category: 'FACULTY', displayOrder: 1 },
    { title: 'President', category: 'LEADERSHIP', displayOrder: 2 },
    { title: 'Vice President', category: 'LEADERSHIP', displayOrder: 3 },
    { title: 'Secretary', category: 'LEADERSHIP', displayOrder: 4 },
    { title: 'Joint Secretary', category: 'LEADERSHIP', displayOrder: 5 },
    { title: 'Treasurer', category: 'LEADERSHIP', displayOrder: 6 },
    { title: 'Technical Lead', category: 'TECHNICAL', displayOrder: 7 },
    { title: 'Event Coordinator', category: 'OPERATIONS', displayOrder: 8 },
    { title: 'Publicity & Social Media Lead', category: 'CREATIVE', displayOrder: 9 },
    { title: 'Design & Creative Lead', category: 'CREATIVE', displayOrder: 10 },
    { title: 'Documentation Lead', category: 'DOCUMENTATION', displayOrder: 11 },
    { title: 'Committee Member', category: 'COMMITTEE', displayOrder: 12 },
  ];

  for (const d of designationsData) {
    await Designation.findOneAndUpdate({ title: d.title }, d, { upsert: true });
  }

  // 3. Authentic Committee Members
  const teamData = [
    {
      name: 'Aditya Dhikale',
      designation: 'President',
      category: 'LEADERSHIP',
      photoUrl: '/assets/team/uday-dhikale.jpg',
      email: 'aditya.dhikale@aces.kbtcoe.in',
      linkedin: 'https://linkedin.com/in/aditya-dhikale',
      bio: 'Leading ACES 2026-27 with focus on departmental collaboration and technical skill development.',
      displayOrder: 1,
      isCurrent: true,
    },
    {
      name: 'Vice President (ACES)',
      designation: 'Vice President',
      category: 'LEADERSHIP',
      photoUrl: '/assets/team/uday-dhikale.jpg',
      bio: 'Coordinating cross-functional departmental activities and academic workshops.',
      displayOrder: 2,
      isCurrent: true,
    },
    {
      name: 'Secretary (ACES)',
      designation: 'Secretary',
      category: 'LEADERSHIP',
      photoUrl: '/assets/team/uday-dhikale.jpg',
      bio: 'Managing club administration, departmental correspondence, and student coordination.',
      displayOrder: 3,
      isCurrent: true,
    },
    {
      name: 'Treasurer (ACES)',
      designation: 'Treasurer',
      category: 'LEADERSHIP',
      photoUrl: '/assets/team/uday-dhikale.jpg',
      bio: 'Overseeing event budgets, financial auditing, and student sponsorships.',
      displayOrder: 4,
      isCurrent: true,
    },
    {
      name: 'Technical Lead (ACES)',
      designation: 'Technical Lead',
      category: 'TECHNICAL',
      photoUrl: '/assets/team/uday-dhikale.jpg',
      bio: 'Driving coding bootcamps, internal hackathons, and technical projects.',
      displayOrder: 5,
      isCurrent: true,
    },
    {
      name: 'Publicity Lead (ACES)',
      designation: 'Publicity & Social Media Lead',
      category: 'CREATIVE',
      photoUrl: '/assets/team/uday-dhikale.jpg',
      bio: 'Managing outreach, event announcements, and media presence for ACES.',
      displayOrder: 6,
      isCurrent: true,
    },
  ];

  for (const m of teamData) {
    await TeamMember.findOneAndUpdate({ name: m.name }, m, { upsert: true });
  }

  // 4. Authentic Departmental Events
  const eventsData = [
    {
      title: 'TECH TANK - EQUITY WARS',
      slug: 'tech-tank-equity-wars',
      shortDescription: 'Flagship intra-departmental hackathon & technical pitch competition for innovators.',
      description: 'Tech Tank - Equity Wars challenges student teams to engineer software prototypes addressing real problems and present to an expert jury.',
      category: 'COMPETITION',
      eventDate: new Date('2026-11-15T09:30:00.000Z'),
      venue: 'Dept. Seminar Hall, MVPS KBTCOE Nashik',
      isPaid: false,
      feeAmountInPaise: 0,
      maxCapacity: 120,
      status: 'PUBLISHED',
      tags: ['Hackathon', 'Pitching', 'Innovation'],
      createdBy: superAdmin._id,
    },
    {
      title: 'Full-Stack Web Architecture Masterclass',
      slug: 'full-stack-web-architecture-masterclass',
      shortDescription: 'Deep dive into modern web microservices, React 19, and scalable backends.',
      description: 'Hands-on weekend masterclass covering industry software design patterns, RESTful APIs, and database indexing.',
      category: 'WORKSHOP',
      eventDate: new Date('2026-11-28T10:00:00.000Z'),
      venue: 'Computer Center Lab 3, KBTCOE Nashik',
      isPaid: true,
      feeAmountInPaise: 15000, // ₹150.00
      upiId: 'aces.kbtcoe@upi',
      maxCapacity: 60,
      status: 'PUBLISHED',
      tags: ['React', 'Node.js', 'System Design'],
      createdBy: superAdmin._id,
    },
    {
      title: 'Competitive Programming & DSA Boot Camp',
      slug: 'dsa-boot-camp-2026',
      shortDescription: 'Comprehensive training in algorithms, dynamic programming, and interview prep.',
      description: 'Structured 3-day series covering advanced graphs, trees, and time complexity optimization led by senior alumni.',
      category: 'WORKSHOP',
      eventDate: new Date('2026-12-05T14:00:00.000Z'),
      venue: 'Online Google Meet & CodeChef Contest',
      isOnline: true,
      onlineMeetingUrl: 'https://meet.google.com/aces-dsa-camp',
      isPaid: false,
      feeAmountInPaise: 0,
      maxCapacity: 200,
      status: 'PUBLISHED',
      tags: ['DSA', 'Algorithms', 'Placement Prep'],
      createdBy: superAdmin._id,
    },
  ];

  for (const e of eventsData) {
    await Event.findOneAndUpdate({ slug: e.slug }, e, { upsert: true });
  }

  // 5. Activities & Achievements
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
    },
  ];

  for (const a of activitiesData) {
    await Activity.findOneAndUpdate({ slug: a.slug }, a, { upsert: true });
  }

  // 6. Site Branding CMS
  await SiteContent.findOneAndUpdate(
    { key: 'branding' },
    {
      key: 'branding',
      data: {
        clubName: 'ACES KBTCOE',
        fullName: "Association of Computer Engineering Students'",
        tagline: 'Where Ideas Meet Innovation.',
        logoUrl: '/assets/aces-logo.jpeg',
        groupPhotoUrl: '/assets/aces-team.jpg',
        department: 'Department of Computer Engineering',
        college: "MVPS's K.B.T. College of Engineering, Nashik",
        contactEmail: 'aces.kbtcoe@gmail.com',
        academicYear: '2026-27',
      },
    },
    { upsert: true }
  );

  console.log('✅ [Seed] Successfully seeded authentic ACES data into MongoDB!');
};

if (process.argv[1]?.includes('seed.js')) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Seed error:', err);
      process.exit(1);
    });
}
