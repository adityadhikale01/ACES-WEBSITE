import mongoose, { Schema, Document } from 'mongoose';

export type ActivityType = 'ACTIVITY' | 'ACHIEVEMENT';

export interface IActivity extends Document {
  title: string;
  type: ActivityType;
  description: string;
  date: Date;
  imageUrl?: string;
  tags: string[];
  displayOrder: number;
  featured: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ActivitySchema = new Schema<IActivity>(
  {
    title: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ['ACTIVITY', 'ACHIEVEMENT'],
      default: 'ACTIVITY',
      index: true,
    },
    description: { type: String, required: true },
    date: { type: Date, default: Date.now },
    imageUrl: { type: String },
    tags: [{ type: String, trim: true }],
    displayOrder: { type: Number, default: 0 },
    featured: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

export const Activity = mongoose.model<IActivity>('Activity', ActivitySchema);
