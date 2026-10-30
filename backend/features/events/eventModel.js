import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    subtitle: {
      type: String,
      trim: true,
    },
    shortDescription: {
      type: String,
      trim: true,
      default: '',
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: [
        'FLAGSHIP',
        'WORKSHOP',
        'CODING',
        'DEVELOPMENT',
        'CHALLENGE',
        'COMMUNITY',
        'MEETUP',
        'SEMINAR',
        'TECHFEST',
        'COMPETITION',
        'HACKATHON',
        'EXPERT_TALK',
        'CULTURAL',
        'OTHER',
      ],
      default: 'WORKSHOP',
      index: true,
    },
    startDate: {
      type: Date,
      required: true,
      index: true,
    },
    eventDate: {
      type: Date,
      index: true,
    },
    endDate: {
      type: Date,
    },
    timeString: {
      type: String,
      default: '10:00 AM - 4:00 PM',
    },
    registrationDeadline: {
      type: Date,
    },
    venue: {
      type: String,
      default: 'Dept. of Computer Engineering, MVPS KBTCOE Nashik',
    },
    isOnline: {
      type: Boolean,
      default: false,
    },
    meetingLink: {
      type: String,
    },
    whatsappGroupUrl: {
      type: String,
      default: 'https://chat.whatsapp.com/ACES-KBTCOE-Events',
    },
    whatsappLink: {
      type: String,
      default: 'https://chat.whatsapp.com/ACES-KBTCOE-Events',
    },
    isGroupEvent: {
      type: Boolean,
      default: false,
    },
    minGroupSize: {
      type: Number,
      default: 1,
    },
    maxGroupSize: {
      type: Number,
      default: 4,
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
    onlineMeetingUrl: {
      type: String,
    },
    posterUrl: {
      type: String,
      default: '/assets/aces-team.jpg',
    },
    isPaid: {
      type: Boolean,
      default: false,
      index: true,
    },
    fee: {
      type: Number,
      default: 0,
    },
    feeAmountInPaise: {
      type: Number,
      default: 0,
    },
    paymentInstructions: {
      type: String,
    },
    paymentUpiId: {
      type: String,
      default: 'aces.kbtcoe@upi',
    },
    upiId: {
      type: String,
      default: 'aces.kbtcoe@upi',
    },
    paymentQrUrl: {
      type: String,
    },
    upiQrCodeUrl: {
      type: String,
    },
    refundPolicy: {
      type: String,
    },
    paymentDeadline: {
      type: Date,
    },
    capacity: {
      type: Number,
      default: null,
    },
    maxCapacity: {
      type: Number,
      default: 100,
    },
    registeredCount: {
      type: Number,
      default: 0,
    },
    registrationCount: {
      type: Number,
      default: 0,
    },
    eligibility: {
      type: String,
      enum: ['OPEN_TO_ALL', 'MEMBERS_ONLY', 'DEPARTMENT_ONLY'],
      default: 'OPEN_TO_ALL',
    },
    status: {
      type: String,
      enum: ['DRAFT', 'PUBLISHED', 'REGISTRATION_CLOSED', 'COMPLETED', 'CANCELLED'],
      default: 'PUBLISHED',
      index: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    organizerInfo: {
      type: String,
      default: 'ACES KBTCOE Committee',
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    prerequisites: [
      {
        type: String,
        trim: true,
      },
    ],
    learningOutcomes: [
      {
        type: String,
        trim: true,
      },
    ],
    facultyCoordinators: [
      {
        name: String,
        designation: String,
      },
    ],
    studentCoordinators: [
      {
        name: String,
        phone: String,
        role: String,
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

eventSchema.pre('save', function (next) {
  if (!this.eventDate && this.startDate) {
    this.eventDate = this.startDate;
  }
  if (!this.startDate && this.eventDate) {
    this.startDate = this.eventDate;
  }
  if (this.fee !== undefined && this.feeAmountInPaise === 0) {
    this.feeAmountInPaise = this.fee;
  }
  if (this.feeAmountInPaise !== undefined && this.fee === 0) {
    this.fee = this.feeAmountInPaise;
  }
  if (!this.shortDescription && this.subtitle) {
    this.shortDescription = this.subtitle;
  }
  if (!this.subtitle && this.shortDescription) {
    this.subtitle = this.shortDescription;
  }
  if (this.registeredCount !== undefined && this.registrationCount === 0) {
    this.registrationCount = this.registeredCount;
  }
  if (this.registrationCount !== undefined && this.registeredCount === 0) {
    this.registeredCount = this.registrationCount;
  }
  if (!this.whatsappGroupUrl && this.whatsappLink) {
    this.whatsappGroupUrl = this.whatsappLink;
  }
  if (!this.whatsappLink && this.whatsappGroupUrl) {
    this.whatsappLink = this.whatsappGroupUrl;
  }
  next();
});

export const Event = mongoose.model('Event', eventSchema);
export default Event;
