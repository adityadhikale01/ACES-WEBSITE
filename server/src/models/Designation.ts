import mongoose, { Schema, Document } from 'mongoose';

export type DesignationTier = 'FACULTY' | 'PRESIDENT' | 'VICE_PRESIDENT' | 'EXECUTIVE' | 'CORE_OFFICER' | 'COMMITTEE' | 'OTHER';

export interface IDesignation extends Document {
  title: string;
  tier: DesignationTier;
  displayOrder: number;
  isRetired: boolean;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

const DesignationSchema = new Schema<IDesignation>(
  {
    title: { type: String, required: true, unique: true, trim: true },
    tier: {
      type: String,
      enum: ['FACULTY', 'PRESIDENT', 'VICE_PRESIDENT', 'EXECUTIVE', 'CORE_OFFICER', 'COMMITTEE', 'OTHER'],
      default: 'COMMITTEE',
      index: true,
    },
    displayOrder: { type: Number, default: 0 },
    isRetired: { type: Boolean, default: false, index: true },
    description: { type: String, trim: true },
  },
  {
    timestamps: true,
  }
);

export const Designation = mongoose.model<IDesignation>('Designation', DesignationSchema);
