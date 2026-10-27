import mongoose, { Schema, Document } from 'mongoose';

export type ApplicationStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface IMembershipApplication extends Document {
  userId?: mongoose.Types.ObjectId;
  fullName: string;
  email: string;
  department: string;
  academicYear: string;
  prnOrRoll?: string;
  areasOfInterest: string[];
  reasonForJoining: string;
  status: ApplicationStatus;
  adminNotes?: string;
  reviewedBy?: string;
  reviewedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const MembershipApplicationSchema = new Schema<IMembershipApplication>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    fullName: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    department: { type: String, required: true, default: 'Computer Engineering' },
    academicYear: { type: String, required: true },
    prnOrRoll: { type: String, trim: true },
    areasOfInterest: [{ type: String, trim: true }],
    reasonForJoining: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'REJECTED'],
      default: 'PENDING',
      index: true,
    },
    adminNotes: { type: String },
    reviewedBy: { type: String },
    reviewedAt: { type: Date },
  },
  {
    timestamps: true,
  }
);

export const MembershipApplication = mongoose.model<IMembershipApplication>(
  'MembershipApplication',
  MembershipApplicationSchema
);
