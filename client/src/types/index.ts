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

  // Paid Event Support (fee in integer paise)
  isPaid: boolean;
  fee: number; // e.g. 20000 = ₹200.00
  paymentInstructions?: string;
  paymentUpiId?: string;
  paymentQrUrl?: string;
  refundPolicy?: string;
  paymentDeadline?: string;

  createdAt: string;
}

export type RegistrationPaymentStatus =
  | 'FREE'
  | 'AWAITING_PAYMENT'
  | 'PROOF_SUBMITTED'
  | 'UNDER_REVIEW'
  | 'VERIFIED'
  | 'REJECTED'
  | 'RESUBMISSION_REQUESTED'
  | 'CANCELLED';

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

  // Payment Tracking
  isPaidEvent: boolean;
  amountDue: number; // paise
  paymentStatus: RegistrationPaymentStatus;
  paymentSubmissionId?: PaymentSubmission | string;
}

export interface PaymentAuditEntry {
  action: string;
  performedBy: string;
  timestamp: string;
  notes?: string;
}

export interface PaymentSubmission {
  _id: string;
  registrationId: EventRegistration | string;
  userId: User | string;
  eventId: EventItem | string;
  expectedAmount: number; // paise
  currency: string;
  utrReference: string;
  screenshotKey: string;
  screenshotMimeType: string;
  screenshotOriginalName: string;
  screenshotSizeBytes: number;
  submittedAt: string;
  status: 'PROOF_SUBMITTED' | 'UNDER_REVIEW' | 'VERIFIED' | 'REJECTED' | 'RESUBMISSION_REQUESTED';
  adminDecisionBy?: string;
  adminNotes?: string;
  rejectionReason?: string;
  verifiedAt?: string;
  auditHistory: PaymentAuditEntry[];
  createdAt: string;
  updatedAt: string;
}

export interface Designation {
  _id: string;
  title: string;
  tier: 'FACULTY' | 'PRESIDENT' | 'VICE_PRESIDENT' | 'EXECUTIVE' | 'CORE_OFFICER' | 'COMMITTEE' | 'OTHER';
  displayOrder: number;
  isRetired: boolean;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
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
  designationId?: Designation | string;
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
  isPublished: boolean;
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

export interface GalleryMediaItem {
  _id: string;
  mediaType: 'IMAGE' | 'VIDEO';
  url: string;
  cloudinaryPublicId?: string;
  caption?: string;
  altText?: string;
  displayOrder: number;
  isCover: boolean;
  uploadedAt: string;
}

export interface EventGalleryAlbum {
  _id: string;
  title: string;
  description?: string;
  eventId?: EventItem | string;
  eventDate: string;
  academicYear?: string;
  category: 'FLAGSHIP' | 'WORKSHOP' | 'COMPETITION' | 'SEMINAR' | 'COMMUNITY' | 'SYMPOSIUM' | 'OTHER';
  coverImageUrl?: string;
  media: GalleryMediaItem[];
  isPublished: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
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
