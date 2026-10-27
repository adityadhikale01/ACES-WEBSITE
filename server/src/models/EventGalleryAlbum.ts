import mongoose, { Schema, Document } from 'mongoose';

export type MediaType = 'IMAGE' | 'VIDEO';

export interface IGalleryMediaItem {
  url: string;
  publicId?: string;
  mediaType: MediaType;
  caption?: string;
  altText?: string;
  displayOrder: number;
  isFeatured: boolean;
}

export interface IEventGalleryAlbum extends Document {
  eventId?: mongoose.Types.ObjectId;
  title: string;
  eventDate: Date;
  description?: string;
  category: string;
  coverMediaUrl: string;
  coverMediaType: MediaType;
  media: IGalleryMediaItem[];
  isPublished: boolean;
  displayOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

const GalleryMediaItemSchema = new Schema<IGalleryMediaItem>(
  {
    url: { type: String, required: true },
    publicId: { type: String },
    mediaType: { type: String, enum: ['IMAGE', 'VIDEO'], default: 'IMAGE' },
    caption: { type: String, trim: true },
    altText: { type: String, trim: true },
    displayOrder: { type: Number, default: 0 },
    isFeatured: { type: Boolean, default: false },
  },
  { _id: true }
);

const EventGalleryAlbumSchema = new Schema<IEventGalleryAlbum>(
  {
    eventId: { type: Schema.Types.ObjectId, ref: 'Event', index: true },
    title: { type: String, required: true, trim: true },
    eventDate: { type: Date, default: Date.now },
    description: { type: String, trim: true },
    category: {
      type: String,
      default: 'WORKSHOP',
      index: true,
    },
    coverMediaUrl: { type: String, required: true },
    coverMediaType: { type: String, enum: ['IMAGE', 'VIDEO'], default: 'IMAGE' },
    media: [GalleryMediaItemSchema],
    isPublished: { type: Boolean, default: true, index: true },
    displayOrder: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

export const EventGalleryAlbum = mongoose.model<IEventGalleryAlbum>(
  'EventGalleryAlbum',
  EventGalleryAlbumSchema
);
