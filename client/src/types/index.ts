export type UserRole = 'VISITOR' | 'MEMBER' | 'ADMIN';

export interface User {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  department?: string;
  academicYear?: string;
  phone?: string;
  avatarUrl?: string;
  isApprovedMember: boolean;
}

export type EventCategory =
  | 'FLAGSHIP'
  | 'WORKSHOP'
  | 'CODING'
  | 'DEVELOPMENT'
  | 'CHALLENGE'
  | 'COMMUNITY'
  | 'MEETUP'
  | 'SEMINAR'
  | 'TECHFEST';

export type EventEligibility = 'OPEN_TO_ALL' | 'MEMBERS_ONLY' | 'DEPARTMENT_ONLY';
export type EventStatus = 'DRAFT' | 'PUBLISHED' | 'CANCELLED' | 'COMPLETED';

export interface EventItem {
  _id: string;
  title: string;
  slug: string;
  subtitle?: string;
  description: string;
  category: EventCategory;
  posterUrl?: string;
  venue: string;
  isOnline: boolean;
  meetingLink?: string;
  startDate: string;
  endDate?: string;
  timeString?: string;
  registrationDeadline: string;
  capacity?: number | null;
  registeredCount: number;
  eligibility: EventEligibility;
  status: EventStatus;
  isFeatured: boolean;
  organizerInfo?: string;
  createdAt: string;
}

export interface EventRegistration {
  _id: string;
  eventId: EventItem | string;
  userId: string;
  fullName: string;
  email: string;
  phone?: string;
  department: string;
  academicYear: string;
  registrationDate: string;
  status: 'REGISTERED' | 'WAITLISTED' | 'CANCELLED' | 'ATTENDED';
  notes?: string;
}

export interface MembershipApplication {
  _id: string;
  fullName: string;
  email: string;
  department: string;
  academicYear: string;
  prnOrRoll?: string;
  areasOfInterest: string[];
  reasonForJoining: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  adminNotes?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  createdAt: string;
}

export type TeamTier = 'FACULTY' | 'PRESIDENT' | 'VICE_PRESIDENT' | 'EXECUTIVE' | 'COMMITTEE';

export interface TeamMember {
  _id: string;
  name: string;
  role: string;
  tier: TeamTier;
  department: string;
  academicYear?: string;
  bio?: string;
  photoUrl: string;
  linkedinUrl?: string;
  githubUrl?: string;
  displayOrder: number;
  isActive: boolean;
}

export interface ActivityItem {
  _id: string;
  title: string;
  type: 'ACTIVITY' | 'ACHIEVEMENT';
  description: string;
  date: string;
  imageUrl?: string;
  tags: string[];
  displayOrder: number;
  featured: boolean;
}

export interface GalleryItem {
  _id: string;
  title: string;
  caption?: string;
  mediaUrl: string;
  category: 'FLAGSHIP' | 'WORKSHOP' | 'COMPETITION' | 'TEAM' | 'COMMUNITY';
  date?: string;
  displayOrder: number;
  featured: boolean;
}

export interface ContactMessage {
  _id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  isRead: boolean;
  notes?: string;
  createdAt: string;
}
