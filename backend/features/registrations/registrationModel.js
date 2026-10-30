import mongoose from 'mongoose';

const registrationSchema = new mongoose.Schema(
  {
    ticketId: {
      type: String,
      unique: true,
      index: true,
    },
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
      index: true,
    },
    // Optional to support guest / without-login registrations
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    fullName: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    department: {
      type: String,
      default: 'Computer Engineering',
    },
    academicYear: {
      type: String,
      default: 'SE',
    },
    prn: {
      type: String,
      default: '',
    },
    prnOrRoll: {
      type: String,
      default: '',
    },
    phone: {
      type: String,
      default: '',
    },
    college: {
      type: String,
      default: "MVPS's K.B.T. College of Engineering, Nashik",
    },
    // Group Event Registration Fields
    isGroupRegistration: {
      type: Boolean,
      default: false,
    },
    groupName: {
      type: String,
      trim: true,
      default: '',
    },
    groupMembers: [
      {
        name: { type: String, trim: true },
        email: { type: String, trim: true },
        phone: { type: String, trim: true },
        prn: { type: String, trim: true },
        role: { type: String, default: 'Member' },
      },
    ],
    // Payment Verification Fields
    isPaidEvent: {
      type: Boolean,
      default: false,
    },
    amountDue: {
      type: Number,
      default: 0,
    },
    paymentScreenshotUrl: {
      type: String,
      default: '',
    },
    utrReference: {
      type: String,
      trim: true,
      default: '',
    },
    status: {
      type: String,
      enum: ['REGISTERED', 'CONFIRMED', 'WAITLISTED', 'CANCELLED', 'ATTENDED'],
      default: 'REGISTERED',
      index: true,
    },
    paymentStatus: {
      type: String,
      enum: [
        'FREE',
        'NOT_APPLICABLE',
        'AWAITING_PAYMENT',
        'PROOF_SUBMITTED',
        'PAYMENT_SUBMITTED',
        'VERIFIED',
        'PAYMENT_VERIFIED',
        'REJECTED',
        'PAYMENT_FAILED',
      ],
      default: 'FREE',
      index: true,
    },
    whatsappJoined: {
      type: Boolean,
      default: false,
    },
    attended: {
      type: Boolean,
      default: false,
    },
    attendanceMarkedAt: {
      type: Date,
    },
    notes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Auto-generate unique Ticket/Registration ID before saving
registrationSchema.pre('save', function (next) {
  if (!this.ticketId) {
    const randomHex = Math.random().toString(36).substring(2, 7).toUpperCase();
    const timeSlice = Date.now().toString().slice(-4);
    this.ticketId = `ACES-EVT-${randomHex}${timeSlice}`;
  }
  if (!this.fullName && this.name) {
    this.fullName = this.name;
  }
  if (!this.name && this.fullName) {
    this.name = this.fullName;
  }
  if (!this.prn && this.prnOrRoll) {
    this.prn = this.prnOrRoll;
  }
  if (!this.prnOrRoll && this.prn) {
    this.prnOrRoll = this.prn;
  }
  next();
});

registrationSchema.index({ eventId: 1, email: 1, status: 1 });
registrationSchema.index(
  { eventId: 1, userId: 1 },
  { unique: true, partialFilterExpression: { userId: { $type: 'objectId' } } }
);

export const Registration = mongoose.model('Registration', registrationSchema);

// Drop old legacy unique index if it exists in MongoDB
Registration.collection.dropIndex('eventId_1_userId_1').catch(() => {});

export default Registration;
