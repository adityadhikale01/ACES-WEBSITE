import mongoose from 'mongoose';

const activitySchema = new mongoose.Schema(
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
    },
    type: {
      type: String,
      enum: ['ACTIVITY', 'ACHIEVEMENT'],
      default: 'ACTIVITY',
      index: true,
    },
    category: {
      type: String,
      enum: [
        'EXPERT_TALK',
        'INDUSTRIAL_VISIT',
        'SOCIAL_INITIATIVE',
        'HACKATHON_WIN',
        'PAPER_PUBLICATION',
        'COMPETITIVE_EXAM',
        'SPORTS_CULTURAL',
        'OTHER',
      ],
      default: 'OTHER',
    },
    date: {
      type: Date,
      default: Date.now,
      index: true,
    },
    description: {
      type: String,
      required: true,
    },
    impactSummary: {
      type: String,
      trim: true,
    },
    studentNames: [
      {
        type: String,
        trim: true,
      },
    ],
    guideName: {
      type: String,
      trim: true,
    },
    imageUrl: {
      type: String,
      default: '/assets/aces-team.jpg',
    },
    documentUrl: {
      type: String,
    },
    isFeatured: {
      type: Boolean,
      default: false,
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

export const Activity = mongoose.model('Activity', activitySchema);
export default Activity;
