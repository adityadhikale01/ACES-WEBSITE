import mongoose from 'mongoose';

const otpVerificationSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    otp: {
      type: String,
      required: true,
    },
    purpose: {
      type: String,
      default: 'MEMBERSHIP_APPLICATION',
      index: true,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 }, // Automatic TTL cleanup by MongoDB
    },
  },
  {
    timestamps: true,
  }
);

export const OtpVerification = mongoose.model('OtpVerification', otpVerificationSchema);
export default OtpVerification;
