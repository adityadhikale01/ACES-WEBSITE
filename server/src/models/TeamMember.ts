import mongoose, { Schema, Document } from 'mongoose';

export type TeamTier = 'FACULTY' | 'PRESIDENT' | 'VICE_PRESIDENT' | 'EXECUTIVE' | 'COMMITTEE';

export interface ITeamMember extends Document {
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
  createdAt: Date;
  updatedAt: Date;
}

const TeamMemberSchema = new Schema<ITeamMember>(
  {
    name: { type: String, required: true, trim: true },
    role: { type: String, required: true, trim: true },
    tier: {
      type: String,
      enum: ['FACULTY', 'PRESIDENT', 'VICE_PRESIDENT', 'EXECUTIVE', 'COMMITTEE'],
      default: 'COMMITTEE',
      index: true,
    },
    department: { type: String, default: 'Computer Engineering' },
    academicYear: { type: String },
    bio: { type: String },
    photoUrl: { type: String, required: true },
    linkedinUrl: { type: String },
    githubUrl: { type: String },
    displayOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true, index: true },
  },
  {
    timestamps: true,
  }
);

export const TeamMember = mongoose.model<ITeamMember>('TeamMember', TeamMemberSchema);
