import mongoose from 'mongoose';

const teamMemberSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    designation: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      enum: ['FACULTY', 'LEADERSHIP', 'TECHNICAL', 'CREATIVE', 'OPERATIONS', 'DOCUMENTATION', 'COMMITTEE'],
      default: 'COMMITTEE',
      index: true,
    },
    photoUrl: {
      type: String,
      default: '/assets/team/uday-dhikale.jpg',
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
    github: {
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
    academicYear: {
      type: String,
      default: '2026-27',
    },
  },
  {
    timestamps: true,
  }
);

export const TeamMember = mongoose.model('TeamMember', teamMemberSchema);
export default TeamMember;
