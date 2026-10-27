import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { User } from '../models/User.js';
import { Event } from '../models/Event.js';
import { TeamMember } from '../models/TeamMember.js';
import { Designation } from '../models/Designation.js';
import { Activity } from '../models/Activity.js';
import { GalleryItem } from '../models/GalleryItem.js';
import { EventGalleryAlbum } from '../models/EventGalleryAlbum.js';
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

    // 2. Seed Standard Designations
    const desCount = await Designation.countDocuments();
    if (desCount === 0) {
      const initialDesignations = [
        { title: 'Faculty Coordinator', tier: 'FACULTY', displayOrder: 1 },
        { title: 'Club President', tier: 'PRESIDENT', displayOrder: 2 },
        { title: 'Vice President', tier: 'VICE_PRESIDENT', displayOrder: 3 },
        { title: 'Treasurer', tier: 'EXECUTIVE', displayOrder: 4 },
        { title: 'Event Coordinator', tier: 'EXECUTIVE', displayOrder: 5 },
        { title: 'Technical Lead', tier: 'EXECUTIVE', displayOrder: 6 },
        { title: 'Publicity & Media Head', tier: 'EXECUTIVE', displayOrder: 7 },
        { title: 'Committee Member', tier: 'COMMITTEE', displayOrder: 8 },
      ];
      await Designation.insertMany(initialDesignations);
      console.log(`[Seed] Seeded ${initialDesignations.length} configurable designations.`);
    }

    // 3. Seed Team Members (Real ACES KBTCOE Committee 2026-27)
    await TeamMember.updateMany({ isPublished: { $exists: false } }, { $set: { isPublished: true } });
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
          isPublished: true,
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
          isPublished: true,
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
          isPublished: true,
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
          isPublished: true,
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
          isPublished: true,
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
          isPublished: true,
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
          isPublished: true,
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
          isPublished: true,
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
          isPublished: true,
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
          isPublished: true,
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
          isPublished: true,
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
          isPublished: true,
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
          isPublished: true,
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
          isPublished: true,
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
          isPublished: true,
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
          isPublished: true,
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
          isPublished: true,
        },
      ];
      await TeamMember.insertMany(teamData);
      console.log(`[Seed] Seeded ${teamData.length} committee team members.`);
    }

    // 4. Seed Events (Both Free and Paid Events)
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
          isPaid: false,
          fee: 0,
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
          isPaid: false,
          fee: 0,
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
          isPaid: false,
          fee: 0,
          organizerInfo: 'ACES AI & Web Head',
        },
        {
          title: 'TECHFEST 2027 HACKATHON',
          slug: 'techfest-2027-hackathon',
          subtitle: '24-Hour Product Sprint & Cash Prize Arena',
          description:
            'The flagship 24-hour departmental hackathon. Build innovative software and hardware prototypes, compete for verified cash prizes, certificates, and direct industry evaluations.',
          category: 'FLAGSHIP',
          posterUrl: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80',
          venue: 'KBTCOE Central Campus, Nashik',
          isOnline: false,
          startDate: new Date('2027-02-20T09:00:00Z'),
          timeString: '9:00 AM Onwards (24-Hour Hack)',
          registrationDeadline: new Date('2027-02-18T23:59:00Z'),
          capacity: 100,
          registeredCount: 28,
          eligibility: 'OPEN_TO_ALL',
          status: 'PUBLISHED',
          isFeatured: true,
          isPaid: true,
          fee: 20000, // Rs. 200 (in paise)
          paymentInstructions:
            'Pay registration fee of Rs. 200 per team via official departmental UPI. Enter the 12-digit UTR and upload the payment receipt.',
          paymentUpiId: 'aces.kbtcoe@upi',
          refundPolicy: 'Refunds permitted if cancellation is requested 48 hours prior to hackathon launch.',
          organizerInfo: 'ACES Flagship Hackathon Team',
        },
      ];
      await Event.insertMany(eventsData);
      console.log(`[Seed] Seeded ${eventsData.length} departmental events.`);
    }

    // 5. Seed Concluded Event Gallery Album (Kachurli Ashram Shala Event)
    const albumCount = await EventGalleryAlbum.countDocuments();
    if (albumCount === 0) {
      const albumData = {
        title: 'Kachurli Ashram Shala Social & Educational Outreach',
        eventDate: new Date('2026-09-23'),
        description:
          'ACES KBTCOE students and faculty conducted an inspiring community outreach initiative at Kachurli Ashram Shala, conducting computer fundamentals workshops, educational sessions, and sharing knowledge.',
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
      };
      await EventGalleryAlbum.create(albumData);
      console.log('[Seed] Seeded Kachurli Ashram Shala concluded event album.');
    }

    // 6. Seed Site Content (CMS)
    const siteContentKeys = ['about_info', 'club_stats', 'contact_details', 'payment_settings'];
    for (const key of siteContentKeys) {
      const existing = await SiteContent.findOne({ key });
      if (!existing) {
        let data: any = {};
        if (key === 'about_info') {
          data = {
            fullName: "Computer Engineering Students' Association",
            shortName: 'ACES KBTCOE',
            department: 'Department of Computer Engineering',
            institution:
              "Maratha Vidya Prasarak Samaj's Karmaveer Adv. Baburao Ganpatrao Thakare College of Engineering (MVPS's KBTCOE)",
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
            location:
              'Department of Computer Engineering, KBTCOE, Udoji Maratha Boarding Campus, Gangapur Road, Nashik - 422013',
            instagram: 'https://instagram.com/aces_kbtcoe',
            linkedin: 'https://linkedin.com/company/aces-kbtcoe',
            github: 'https://github.com/aces-kbtcoe',
          };
        } else if (key === 'payment_settings') {
          data = {
            defaultUpiId: 'aces.kbtcoe@upi',
            recipientName: 'ACES KBTCOE Departmental Club',
            bankName: 'Bank of Maharashtra (KBTCOE Branch)',
            instructionsNote:
              'Please verify payment details before sending. Enter the correct 12-digit UTR reference on submission.',
          };
        }
        await SiteContent.create({ key, data });
      }
    }
    console.log('[Seed] Seeding completed successfully!');
  } catch (error: any) {
    console.error('[Seed] Seeding error:', error.message);
  }
};
