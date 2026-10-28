import mongoose from 'mongoose';

const registrationSchema = new mongoose.Schema(
  {
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    department: {
      type: String,
      default: 'Computer Engineering',
    },
    academicYear: {
      type: String,
    },
    prn: {
      type: String,
    },
    phone: {
      type: String,
    },
    status: {
      type: String,
      enum: ['REGISTERED', 'WAITLISTED', 'CANCELLED', 'ATTENDED'],
      default: 'REGISTERED',
      index: true,
    },
    paymentStatus: {
      type: String,
      enum: ['NOT_APPLICABLE', 'AWAITING_PAYMENT', 'PAYMENT_SUBMITTED', 'PAYMENT_VERIFIED', 'PAYMENT_FAILED'],
      default: 'NOT_APPLICABLE',
      index: true,
    },
    attended: {
      type: Boolean,
      default: false,
    },
    attendanceMarkedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

registrationSchema.index({ eventId: 1, userId: 1 }, { unique: true });

export const Registration = mongoose.model('Registration', registrationSchema);
export default Registration;
