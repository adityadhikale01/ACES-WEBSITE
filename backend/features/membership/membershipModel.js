import mongoose from 'mongoose';

const membershipApplicationSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    department: {
      type: String,
      default: 'Computer Engineering',
    },
    academicYear: {
      type: String,
      required: true,
    },
    division: {
      type: String,
    },
    prn: {
      type: String,
    },
    rollNumber: {
      type: String,
    },
    interestedDomains: [
      {
        type: String,
      },
    ],
    whyJoin: {
      type: String,
      required: true,
    },
    technicalSkills: {
      type: String,
    },
    pastExperience: {
      type: String,
    },
    status: {
      type: String,
      enum: ['PENDING', 'ACCEPTED', 'REJECTED'],
      default: 'PENDING',
      index: true,
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    reviewedAt: {
      type: Date,
    },
    reviewerNotes: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

export const MembershipApplication = mongoose.model(
  'MembershipApplication',
  membershipApplicationSchema
);
export default MembershipApplication;
