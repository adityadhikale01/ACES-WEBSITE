import mongoose from 'mongoose';

const mediaItemSchema = new mongoose.Schema(
  {
    albumId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Album',
      required: true,
      index: true,
    },
    mediaType: {
      type: String,
      enum: ['IMAGE', 'VIDEO'],
      default: 'IMAGE',
    },
    url: {
      type: String,
      required: true,
    },
    caption: {
      type: String,
      trim: true,
    },
    displayOrder: {
      type: Number,
      default: 100,
    },
  },
  {
    timestamps: true,
  }
);

const albumSchema = new mongoose.Schema(
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
    description: {
      type: String,
      trim: true,
    },
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
    },
    eventDate: {
      type: Date,
      default: Date.now,
    },
    coverMediaUrl: {
      type: String,
      default: '/assets/aces-team.jpg',
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
    mediaCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

export const Album = mongoose.model('Album', albumSchema);
export const MediaItem = mongoose.model('MediaItem', mediaItemSchema);

export default { Album, MediaItem };
