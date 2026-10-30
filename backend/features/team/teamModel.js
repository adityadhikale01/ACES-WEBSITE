import mongoose from 'mongoose';

const teamMemberSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    role: {
      type: String,
      trim: true,
      default: 'Committee Member',
    },
    designation: {
      type: String,
      trim: true,
    },
    designationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Designation',
    },
    tier: {
      type: String,
      enum: ['FACULTY', 'PRESIDENT', 'VICE_PRESIDENT', 'EXECUTIVE', 'COMMITTEE'],
      default: 'COMMITTEE',
      index: true,
    },
    category: {
      type: String,
      enum: ['FACULTY', 'LEADERSHIP', 'TECHNICAL', 'CREATIVE', 'OPERATIONS', 'DOCUMENTATION', 'COMMITTEE'],
      default: 'COMMITTEE',
      index: true,
    },
    department: {
      type: String,
      default: 'Computer Engineering',
    },
    academicYear: {
      type: String,
      default: '2026-27',
    },
    photoUrl: {
      type: String,
      default: '/assets/aces-team.jpg',
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    linkedin: {
      type: String,
      trim: true,
    },
    linkedinUrl: {
      type: String,
      trim: true,
    },
    github: {
      type: String,
      trim: true,
    },
    githubUrl: {
      type: String,
      trim: true,
    },
    bio: {
      type: String,
      trim: true,
    },
    displayOrder: {
      type: Number,
      default: 100,
      index: true,
    },
    isCurrent: {
      type: Boolean,
      default: true,
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    isPublished: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

export const TeamMember = mongoose.model('TeamMember', teamMemberSchema);
export default TeamMember;
