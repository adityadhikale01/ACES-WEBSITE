import mongoose, { Schema, Document } from 'mongoose';

export type RegistrationStatus = 'REGISTERED' | 'WAITLISTED' | 'CANCELLED' | 'ATTENDED';

export interface IEventRegistration extends Document {
  eventId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  fullName: string;
  email: string;
  phone?: string;
  department: string;
  academicYear: string;
  prnOrRoll?: string;
  registrationDate: Date;
  status: RegistrationStatus;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const EventRegistrationSchema = new Schema<IEventRegistration>(
  {
    eventId: { type: Schema.Types.ObjectId, ref: 'Event', required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, trim: true },
    department: { type: String, required: true, default: 'Computer Engineering' },
    academicYear: { type: String, required: true },
    prnOrRoll: { type: String, trim: true },
    registrationDate: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ['REGISTERED', 'WAITLISTED', 'CANCELLED', 'ATTENDED'],
      default: 'REGISTERED',
      index: true,
    },
    notes: { type: String },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate active registrations for the same user and event
EventRegistrationSchema.index({ eventId: 1, userId: 1 }, { unique: true });

export const EventRegistration = mongoose.model<IEventRegistration>(
  'EventRegistration',
  EventRegistrationSchema
);
