import mongoose, { Schema, Document } from 'mongoose';

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

export interface IEvent extends Document {
  title: string;
  slug: string;
  subtitle?: string;
  description: string;
  category: EventCategory;
  posterUrl?: string;
  venue: string;
  isOnline: boolean;
  meetingLink?: string;
  startDate: Date;
  endDate?: Date;
  timeString?: string;
  registrationDeadline: Date;
  capacity?: number | null; // null means unlimited
  registeredCount: number;
  eligibility: EventEligibility;
  status: EventStatus;
  isFeatured: boolean;
  organizerInfo?: string;

  // Paid event fields
  isPaid: boolean;
  fee: number; // in integer paise (e.g. 15000 = Rs. 150)
  paymentInstructions?: string;
  paymentUpiId?: string;
  paymentQrUrl?: string;
  refundPolicy?: string;
  paymentDeadline?: Date;

  createdAt: Date;
  updatedAt: Date;
}

const EventSchema = new Schema<IEvent>(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    subtitle: { type: String, trim: true },
    description: { type: String, required: true },
    category: {
      type: String,
      enum: ['FLAGSHIP', 'WORKSHOP', 'CODING', 'DEVELOPMENT', 'CHALLENGE', 'COMMUNITY', 'MEETUP', 'SEMINAR', 'TECHFEST'],
      default: 'WORKSHOP',
      index: true,
    },
    posterUrl: { type: String },
    venue: { type: String, required: true, default: 'Seminar Hall, KBTCOE' },
    isOnline: { type: Boolean, default: false },
    meetingLink: { type: String },
    startDate: { type: Date, required: true, index: true },
    endDate: { type: Date },
    timeString: { type: String, default: '10:00 AM' },
    registrationDeadline: { type: Date, required: true },
    capacity: { type: Number, default: null },
    registeredCount: { type: Number, default: 0 },
    eligibility: {
      type: String,
      enum: ['OPEN_TO_ALL', 'MEMBERS_ONLY', 'DEPARTMENT_ONLY'],
      default: 'OPEN_TO_ALL',
    },
    status: {
      type: String,
      enum: ['DRAFT', 'PUBLISHED', 'CANCELLED', 'COMPLETED'],
      default: 'PUBLISHED',
      index: true,
    },
    isFeatured: { type: Boolean, default: false },
    organizerInfo: { type: String, default: 'ACES KBTCOE Committee' },

    // Paid event configurations
    isPaid: { type: Boolean, default: false, index: true },
    fee: { type: Number, default: 0 }, // in paise
    paymentInstructions: { type: String },
    paymentUpiId: { type: String },
    paymentQrUrl: { type: String },
    refundPolicy: { type: String },
    paymentDeadline: { type: Date },
  },
  {
    timestamps: true,
  }
);

export const Event = mongoose.model<IEvent>('Event', EventSchema);
