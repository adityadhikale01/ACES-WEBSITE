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
    name: this.name,
    email: this.email,
    role: this.role,
    department: this.department,
    academicYear: this.academicYear,
    prn: this.prn,
    phone: this.phone,
    createdAt: this.createdAt,
  };
};

export const User = mongoose.model('User', userSchema);
export default User;
