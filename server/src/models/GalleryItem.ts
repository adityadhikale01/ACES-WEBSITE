import mongoose, { Schema, Document } from 'mongoose';

export type MediaCategory = 'FLAGSHIP' | 'WORKSHOP' | 'COMPETITION' | 'TEAM' | 'COMMUNITY';

export interface IGalleryItem extends Document {
  title: string;
  caption?: string;
  mediaUrl: string;
  category: MediaCategory;
  date?: Date;
  displayOrder: number;
  featured: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const GalleryItemSchema = new Schema<IGalleryItem>(
  {
    title: { type: String, required: true, trim: true },
    caption: { type: String, trim: true },
    mediaUrl: { type: String, required: true },
    category: {
      type: String,
      enum: ['FLAGSHIP', 'WORKSHOP', 'COMPETITION', 'TEAM', 'COMMUNITY'],
      default: 'WORKSHOP',
      index: true,
    },
    date: { type: Date, default: Date.now },
    displayOrder: { type: Number, default: 0 },
    featured: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

export const GalleryItem = mongoose.model<IGalleryItem>('GalleryItem', GalleryItemSchema);
