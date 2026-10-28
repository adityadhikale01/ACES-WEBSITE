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
    shortDescription: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: ['WORKSHOP', 'SEMINAR', 'COMPETITION', 'HACKATHON', 'EXPERT_TALK', 'CULTURAL', 'OTHER'],
      default: 'WORKSHOP',
      index: true,
    },
    eventDate: {
      type: Date,
      required: true,
      index: true,
    },
    endDate: {
      type: Date,
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
    feeAmountInPaise: {
      type: Number,
      default: 0,
    },
    upiId: {
      type: String,
      default: 'aces.kbtcoe@upi',
    },
    upiQrCodeUrl: {
      type: String,
    },
    maxCapacity: {
      type: Number,
      default: 100,
    },
    registrationCount: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['DRAFT', 'PUBLISHED', 'REGISTRATION_CLOSED', 'COMPLETED', 'CANCELLED'],
      default: 'PUBLISHED',
      index: true,
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

export const Event = mongoose.model('Event', eventSchema);
export default Event;
