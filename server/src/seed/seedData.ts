import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { User } from '../models/User.js';
import { Event } from '../models/Event.js';
import { TeamMember } from '../models/TeamMember.js';
import { Activity } from '../models/Activity.js';
import { GalleryItem } from '../models/GalleryItem.js';
import { SiteContent } from '../models/SiteContent.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/aces_kbtcoe';

export const seedDatabase = async () => {
  try {
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(MONGODB_URI);
      console.log('[Seed] Connected to MongoDB for seeding');
    }

    // 1. Seed Admin User
    const adminEmail = (process.env.ADMIN_EMAIL || 'aces.kbtcoe@gmail.com').toLowerCase();
    const adminPassword = process.env.ADMIN_PASSWORD || 'AcesAdmin@2026';
    const existingAdmin = await User.findOne({ email: adminEmail });

    if (!existingAdmin) {
      const passwordHash = await bcrypt.hash(adminPassword, 10);
      await User.create({
        fullName: 'ACES Faculty & Lead Admin',
        email: adminEmail,
        passwordHash,
        role: 'ADMIN',
        department: 'Computer Engineering',
        academicYear: 'FACULTY',
        phone: '+91 253 2571439',
        isApprovedMember: true,
      });
      console.log(`[Seed] Initial Admin created: ${adminEmail}`);
    } else {
      console.log(`[Seed] Admin already exists: ${adminEmail}`);
    }

    // 2. Seed Team Members (Real ACES KBTCOE Committee 2026-27)
    const teamCount = await TeamMember.countDocuments();
    if (teamCount === 0) {
      const teamData = [
        {
          name: 'Aditya Dhikale',
          role: 'PRESIDENT',
          tier: 'PRESIDENT',
          department: 'Computer Engineering',
          academicYear: 'BE',
          bio: 'Leading ACES 2026-27 to build a vibrant culture of learning, building, and innovation within the department.',
          photoUrl: '/assets/members/President.jpeg',
          linkedinUrl: 'https://linkedin.com',
          displayOrder: 1,
          isActive: true,
        },
        {
          name: 'Sammpana Kasar',
          role: 'VICE PRESIDENT',
          tier: 'VICE_PRESIDENT',
          department: 'Computer Engineering',
          academicYear: 'BE',
          bio: 'Spearheading departmental initiatives, student mentorship, and strategic community outreach.',
          photoUrl: '/assets/members/VicePresident.png',
          linkedinUrl: 'https://linkedin.com',
          displayOrder: 2,
          isActive: true,
        },
        {
          name: 'Ayush Talekar',
          role: 'TREASURER',
          tier: 'EXECUTIVE',
          department: 'Computer Engineering',
          academicYear: 'TE',
          bio: 'Managing club finances, budgeting for flagship events, and resource management.',
          photoUrl: '/assets/members/AyushTalekar(Treasurer).jpg',
          displayOrder: 3,
          isActive: true,
        },
        {
          name: 'Khushi Mansuri',
          role: 'EVENT COORDINATOR',
          tier: 'EXECUTIVE',
          department: 'Computer Engineering',
          academicYear: 'TE',
          bio: 'Coordinating workshops, competitions, and technical logistics across the academic year.',
          photoUrl: '/assets/members/KhushiMansuri(Event Coordinator).png',
          displayOrder: 4,
          isActive: true,
        },
        {
          name: 'Yash Patil',
          role: 'EVENT COORDINATOR',
          tier: 'EXECUTIVE',
          department: 'Computer Engineering',
          academicYear: 'TE',
          bio: 'Organizing seamless technical sessions, scheduling, and on-ground execution.',
          photoUrl: '/assets/members/yash_Patil(Event Coordinator).jpg',
          displayOrder: 5,
          isActive: true,
        },
        {
          name: 'Arjun Patil',
          role: 'COMMITTEE MEMBER',
          tier: 'COMMITTEE',
          department: 'Computer Engineering',
          academicYear: 'TE',
          photoUrl: '/assets/members/arjun_patil.jpg',
          displayOrder: 6,
          isActive: true,
        },
        {
          name: 'Atharva Vispute',
          role: 'COMMITTEE MEMBER',
          tier: 'COMMITTEE',
          department: 'Computer Engineering',
          academicYear: 'SE',
          photoUrl: '/assets/members/Atharva_vispute.png',
          displayOrder: 7,
          isActive: true,
        },
        {
          name: 'Apurva Rahane',
          role: 'COMMITTEE MEMBER',
          tier: 'COMMITTEE',
          department: 'Computer Engineering',
          academicYear: 'SE',
          photoUrl: '/assets/members/Apurva_Rahane.png',
          displayOrder: 8,
          isActive: true,
        },
        {
          name: 'Ronit Raheja',
          role: 'COMMITTEE MEMBER',
          tier: 'COMMITTEE',
          department: 'Computer Engineering',
          academicYear: 'SE',
          photoUrl: '/assets/members/ronitraheja.jpeg',
          displayOrder: 9,
          isActive: true,
        },
        {
          name: 'Purva Sonawane',
          role: 'COMMITTEE MEMBER',
          tier: 'COMMITTEE',
          department: 'Computer Engineering',
          academicYear: 'SE',
          photoUrl: '/assets/members/purva sonawane.png',
          displayOrder: 10,
          isActive: true,
        },
        {
          name: 'Sarthak Patil',
          role: 'COMMITTEE MEMBER',
          tier: 'COMMITTEE',
          department: 'Computer Engineering',
          academicYear: 'SE',
          photoUrl: '/assets/members/Sarthak Patil.jpg',
          displayOrder: 11,
          isActive: true,
        },
        {
          name: 'Sanyukti Gangurde',
          role: 'COMMITTEE MEMBER',
          tier: 'COMMITTEE',
          department: 'Computer Engineering',
          academicYear: 'SE',
          photoUrl: '/assets/members/sanyukti gangurde.png',
          displayOrder: 12,
          isActive: true,
        },
        {
          name: 'Mrunal Amrutkar',
          role: 'COMMITTEE MEMBER',
          tier: 'COMMITTEE',
          department: 'Computer Engineering',
          academicYear: 'SE',
          photoUrl: '/assets/members/Mrunal Amrutkar.jpg',
          displayOrder: 13,
          isActive: true,
        },
        {
          name: 'Mrunal Thete',
          role: 'COMMITTEE MEMBER',
          tier: 'COMMITTEE',
          department: 'Computer Engineering',
          academicYear: 'SE',
          photoUrl: '/assets/members/Mrunal Thete.jpg',
          displayOrder: 14,
          isActive: true,
        },
        {
          name: 'Nirali Shah',
          role: 'COMMITTEE MEMBER',
          tier: 'COMMITTEE',
          department: 'Computer Engineering',
          academicYear: 'SE',
          photoUrl: '/assets/members/Nirali Shah.jpeg',
          displayOrder: 15,
          isActive: true,
        },
        {
          name: 'Shraddha Sonar',
          role: 'COMMITTEE MEMBER',
          tier: 'COMMITTEE',
          department: 'Computer Engineering',
          academicYear: 'SE',
          photoUrl: '/assets/members/sharadhha sonar_Drive.jpg',
          displayOrder: 16,
          isActive: true,
        },
        {
          name: 'Jiya Shah',
          role: 'COMMITTEE MEMBER',
          tier: 'COMMITTEE',
          department: 'Computer Engineering',
          academicYear: 'SE',
          photoUrl: '/assets/members/JIYA SHAH.jpg',
          displayOrder: 17,
          isActive: true,
        },
      ];
      await TeamMember.insertMany(teamData);
      console.log(`[Seed] Seeded ${teamData.length} committee team members.`);
    }

    // 3. Seed Events
    const eventCount = await Event.countDocuments();
    if (eventCount === 0) {
      const eventsData = [
        {
          title: 'TECH TANK - EQUITY WARS',
          slug: 'tech-tank-equity-wars',
          subtitle: 'The Departmental Startup Pitch & Valuation Arena',
          description:
            'Pitch your boldest startup idea, defend your tech stack and valuation, and compete against the sharpest minds in the Computer Engineering department in front of guest judges.',
          category: 'FLAGSHIP',
          posterUrl: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1200&q=80',
          venue: 'Seminar Hall, KBTCOE',
          isOnline: false,
          startDate: new Date('2026-11-14T10:00:00Z'),
          timeString: '10:00 AM - 4:00 PM',
          registrationDeadline: new Date('2026-11-12T23:59:59Z'),
          capacity: 120,
          registeredCount: 42,
          eligibility: 'OPEN_TO_ALL',
          status: 'PUBLISHED',
          isFeatured: true,
          organizerInfo: 'ACES KBTCOE Flagship Committee',
        },
        {
          title: 'CODERUSH 2026',
          slug: 'coderush-2026',
          subtitle: 'Speed, DSA & Algorithmic Problem Solving',
          description:
            'A high-energy competitive programming challenge focused on Data Structures, logic, algorithmic optimization, and real-world edge cases. Test your coding endurance.',
          category: 'CODING',
          posterUrl: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=1200&q=80',
          venue: 'Computer Lab 01 & 02, Department of Computer Engineering',
          isOnline: false,
          startDate: new Date('2026-11-21T11:00:00Z'),
          timeString: '11:00 AM - 2:00 PM',
          registrationDeadline: new Date('2026-11-20T18:00:00Z'),
          capacity: 80,
          registeredCount: 65,
          eligibility: 'OPEN_TO_ALL',
          status: 'PUBLISHED',
          isFeatured: true,
          organizerInfo: 'ACES Technical Domain',
        },
        {
          title: 'BUILD WITH AI & AGENTS',
          slug: 'build-with-ai-agents',
          subtitle: 'Hands-on Generative AI and Autonomous Coding',
          description:
            'Explore the world of modern LLMs, function-calling agents, and real-time AI toolsets. Learn how modern software engineers build production-ready AI applications.',
          category: 'WORKSHOP',
          posterUrl: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=1200&q=80',
          venue: 'Auditorium, KBTCOE',
          isOnline: false,
          startDate: new Date('2026-12-05T14:00:00Z'),
          timeString: '2:00 PM - 5:30 PM',
          registrationDeadline: new Date('2026-12-04T20:00:00Z'),
          capacity: 150,
          registeredCount: 110,
          eligibility: 'OPEN_TO_ALL',
          status: 'PUBLISHED',
          isFeatured: true,
          organizerInfo: 'ACES AI & Web Head',
        },
        {
          title: 'WEBCRAFT FRONTEND MASTERY',
          slug: 'webcraft-frontend-mastery',
          subtitle: 'Modern UI/UX & Responsive Web Architecture',
          description:
            'Design and build a responsive web experience from scratch using React, Tailwind CSS, and modern web APIs. Includes live mentoring from senior developers.',
          category: 'DEVELOPMENT',
          posterUrl: 'https://images.unsplash.com/photo-1547658719-da2b51169166?auto=format&fit=crop&w=1200&q=80',
          venue: 'Innovation Lab, 3rd Floor',
          isOnline: false,
          startDate: new Date('2026-10-17T10:30:00Z'),
          timeString: '10:30 AM - 3:30 PM',
          registrationDeadline: new Date('2026-10-16T18:00:00Z'),
          capacity: 70,
          registeredCount: 30,
          eligibility: 'MEMBERS_ONLY',
          status: 'PUBLISHED',
          isFeatured: false,
          organizerInfo: 'ACES Web Domain',
        },
        {
          title: 'DEBUG THE CODE',
          slug: 'debug-the-code',
          subtitle: 'Spot the Bug, Fix the Logic, Beat the Clock',
          description:
            'Find the subtle concurrency bug, memory leak, or syntax anomaly across C++, Java, and Python codebases under tight countdown pressure.',
          category: 'CHALLENGE',
          posterUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80',
          venue: 'Computer Lab 02',
          isOnline: false,
          startDate: new Date('2026-11-07T11:00:00Z'),
          timeString: '11:00 AM - 1:30 PM',
          registrationDeadline: new Date('2026-11-06T20:00:00Z'),
          capacity: 60,
          registeredCount: 15,
          eligibility: 'OPEN_TO_ALL',
          status: 'PUBLISHED',
          isFeatured: false,
          organizerInfo: 'ACES Competitive Domain',
        },
        {
          title: 'ACES TALKS: INDUSTRY PERSPECTIVES',
          slug: 'aces-talks-industry-perspectives',
          subtitle: 'Connecting Students with Senior Engineers & Tech Leads',
          description:
            'An interactive seminar featuring alumni and tech leads from top engineering companies discussing software engineering roles, open source, and career navigation.',
          category: 'COMMUNITY',
          posterUrl: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=1200&q=80',
          venue: 'Seminar Hall, KBTCOE',
          isOnline: false,
          startDate: new Date('2026-12-05T15:00:00Z'),
          timeString: '3:00 PM - 5:00 PM',
          registrationDeadline: new Date('2026-12-04T23:59:00Z'),
          capacity: 200,
          registeredCount: 88,
          eligibility: 'OPEN_TO_ALL',
          status: 'PUBLISHED',
          isFeatured: false,
          organizerInfo: 'ACES PR & Outreach Team',
        },
      ];
      await Event.insertMany(eventsData);
      console.log(`[Seed] Seeded ${eventsData.length} departmental events.`);
    }

    // 4. Seed Activities & Achievements
    const actCount = await Activity.countDocuments();
    if (actCount === 0) {
      const activitiesData = [
        {
          title: 'Department Induction & ACES Orientation 2026',
          type: 'ACTIVITY',
          description:
            'Welcomed newly joined computer engineering students with interactive icebreaking sessions, club overview, and technical roadmap briefing.',
          date: new Date('2026-08-10'),
          imageUrl: '/assets/aces-team.jpg',
          tags: ['Orientation', 'Induction', 'Student Community'],
          displayOrder: 1,
          featured: true,
        },
        {
          title: 'National Hackathon Finalists Recognition',
          type: 'ACHIEVEMENT',
          description:
            'Departmental teams mentored by ACES seniors qualified for the Grand Finale of Smart India Hackathon and regional inter-college competitions.',
          date: new Date('2026-09-01'),
          imageUrl: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80',
          tags: ['Hackathon', 'Excellence', 'Innovation'],
          displayOrder: 2,
          featured: true,
        },
        {
          title: 'Open Source Contribution Sprint',
          type: 'ACTIVITY',
          description:
            'Organized a 2-day hands-on Git & GitHub workshop guiding 100+ students through opening their very first pull requests to active repositories.',
          date: new Date('2026-09-25'),
          imageUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80',
          tags: ['Git', 'OpenSource', 'Workshop'],
          displayOrder: 3,
          featured: true,
        },
      ];
      await Activity.insertMany(activitiesData);
      console.log(`[Seed] Seeded ${activitiesData.length} activities and achievements.`);
    }

    // 5. Seed Gallery Items
    const galleryCount = await GalleryItem.countDocuments();
    if (galleryCount === 0) {
      const galleryData = [
        {
          title: 'ACES 2026-27 Executive Committee & Team',
          caption: 'Official full committee group photograph at KBTCOE Campus.',
          mediaUrl: '/assets/aces-team.jpg',
          category: 'TEAM',
          displayOrder: 1,
          featured: true,
        },
        {
          title: 'Annual TechFest Coding Contest',
          caption: 'Students solving algorithmic questions in Computer Lab 01.',
          mediaUrl: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=1200&q=80',
          category: 'COMPETITION',
          displayOrder: 2,
          featured: true,
        },
        {
          title: 'Build With AI Hands-on Session',
          caption: 'Interactive workshop on modern web technologies and AI integration.',
          mediaUrl: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=1200&q=80',
          category: 'WORKSHOP',
          displayOrder: 3,
          featured: true,
        },
        {
          title: 'Tech Tank Idea Presentation',
          caption: 'Teams pitching their engineering solutions to jury members.',
          mediaUrl: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1200&q=80',
          category: 'FLAGSHIP',
          displayOrder: 4,
          featured: true,
        },
      ];
      await GalleryItem.insertMany(galleryData);
      console.log(`[Seed] Seeded ${galleryData.length} gallery items.`);
    }

    // 6. Seed Site Content (CMS)
    const siteContentKeys = ['about_info', 'club_stats', 'contact_details'];
    for (const key of siteContentKeys) {
      const existing = await SiteContent.findOne({ key });
      if (!existing) {
        let data: any = {};
        if (key === 'about_info') {
          data = {
            fullName: "Computer Engineering Students' Association",
            shortName: 'ACES KBTCOE',
            department: 'Department of Computer Engineering',
            institution: "Maratha Vidya Prasarak Samaj's Karmaveer Adv. Baburao Ganpatrao Thakare College of Engineering (MVPS's KBTCOE)",
            location: 'Gangapur Road, Nashik - 422013, Maharashtra, India',
            motto: 'Learn. Build. Connect. Lead.',
            mission:
              'To cultivate a student-led collaborative environment where curiosity turns into technical competence, hands-on experience, and impactful engineering leadership.',
            vision:
              'To build a community of computer engineering students who are technically strong, creatively curious, and equipped to lead modern technology domains.',
          };
        } else if (key === 'club_stats') {
          data = {
            activeMembers: '50+',
            academicTerm: '2026 - 27',
            flagshipEvents: '03',
            workshopsConducted: '15+',
          };
        } else if (key === 'contact_details') {
          data = {
            email: 'aces.kbtcoe@gmail.com',
            phone: '+91 253 2571439',
            location: 'Department of Computer Engineering, KBTCOE, Udoji Maratha Boarding Campus, Gangapur Road, Nashik - 422013',
            instagram: 'https://instagram.com/aces_kbtcoe',
            linkedin: 'https://linkedin.com/company/aces-kbtcoe',
            github: 'https://github.com/aces-kbtcoe',
          };
        }
        await SiteContent.create({ key, data });
      }
    }
    console.log('[Seed] Site content CMS initialized.');
    console.log('[Seed] Seeding completed successfully!');
  } catch (error: any) {
    console.error('[Seed] Seeding error:', error.message);
  }
};

// Execute directly if run as a script
if (process.argv[1]?.endsWith('seedData.ts') || process.argv[1]?.endsWith('seedData.js')) {
  seedDatabase().then(() => {
    process.exit(0);
  });
}
