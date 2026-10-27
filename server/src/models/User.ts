import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export type UserRole = 'VISITOR' | 'MEMBER' | 'ADMIN';

export interface IUser extends Document {
  fullName: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  phone?: string;
  department?: string;
  academicYear?: string;
  avatarUrl?: string;
  isApprovedMember: boolean;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidate: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
  {
    fullName: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      enum: ['VISITOR', 'MEMBER', 'ADMIN'],
      default: 'MEMBER',
      index: true,
    },
    phone: { type: String, trim: true },
    department: { type: String, default: 'Computer Engineering' },
    academicYear: { type: String, enum: ['FE', 'SE', 'TE', 'BE', 'ALUMNI', 'FACULTY', 'OTHER'], default: 'SE' },
    avatarUrl: { type: String },
    isApprovedMember: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

// Method to verify password
UserSchema.methods.comparePassword = async function (candidate: string): Promise<boolean> {
  return bcrypt.compare(candidate, this.passwordHash);
};

export const User = mongoose.model<IUser>('User', UserSchema);
