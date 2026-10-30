import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

export const USER_ROLES = ['SUPER_ADMIN', 'ADMIN', 'FACULTY', 'PRESIDENT', 'MEMBER', 'VISITOR'];

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: USER_ROLES,
      default: 'MEMBER',
      index: true,
    },
    department: {
      type: String,
      default: 'Computer Engineering',
      trim: true,
    },
    academicYear: {
      type: String,
      trim: true,
    },
    prn: {
      type: String,
      sparse: true,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    photoUrl: {
      type: String,
      default: '/assets/aces-team.jpg',
    },
    bio: {
      type: String,
      trim: true,
      default: '',
    },
    linkedinUrl: {
      type: String,
      trim: true,
      default: '',
    },
    githubUrl: {
      type: String,
      trim: true,
      default: '',
    },
    isApprovedMember: {
      type: Boolean,
      default: false,
      index: true,
    },
    assignedPost: {
      type: String,
      trim: true,
      default: 'ACES Member',
    },
    postCategory: {
      type: String,
      enum: ['PRESIDENT', 'VICE_PRESIDENT', 'EXECUTION_TEAM', 'MEMBER', 'FACULTY'],
      default: 'MEMBER',
      index: true,
    },
    displayOrder: {
      type: Number,
      default: 100,
      index: true,
    },
    isPublishedOnTeam: {
      type: Boolean,
      default: true,
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLoginAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

userSchema.methods.toSafeObject = function () {
  return {
    id: this._id.toString(),
    _id: this._id.toString(),
    name: this.name,
    fullName: this.name,
    email: this.email,
    role: this.role,
    department: this.department,
    academicYear: this.academicYear,
    prn: this.prn,
    phone: this.phone,
    photoUrl: this.photoUrl || '/assets/aces-team.jpg',
    bio: this.bio || '',
    linkedinUrl: this.linkedinUrl || '',
    githubUrl: this.githubUrl || '',
    assignedPost: this.assignedPost || (this.role === 'PRESIDENT' ? 'President' : 'ACES Member'),
    postCategory: this.postCategory || (this.role === 'PRESIDENT' ? 'PRESIDENT' : 'MEMBER'),
    displayOrder: this.displayOrder || 100,
    isPublishedOnTeam: this.isPublishedOnTeam ?? true,
    isApprovedMember: Boolean(this.isApprovedMember || ['SUPER_ADMIN', 'ADMIN', 'FACULTY', 'PRESIDENT'].includes(this.role)),
    createdAt: this.createdAt,
  };
};

export const User = mongoose.model('User', userSchema);
export default User;
