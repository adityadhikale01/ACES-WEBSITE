import { Request, Response } from 'express';
import { EventGalleryAlbum } from '../models/EventGalleryAlbum.js';
import { GalleryItem } from '../models/GalleryItem.js';
import { Event } from '../models/Event.js';
import { uploadGalleryMedia } from '../services/storageService.js';

export const getGalleryAlbums = async (_req: Request, res: Response): Promise<void> => {
  try {
    const albums = await EventGalleryAlbum.find({ isPublished: true })
      .populate('eventId', 'title slug category startDate')
      .sort({ eventDate: -1, displayOrder: 1 });

    res.json({ success: true, count: albums.length, albums });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllAlbumsAdmin = async (_req: Request, res: Response): Promise<void> => {
  try {
    const albums = await EventGalleryAlbum.find()
      .populate('eventId', 'title slug category startDate status')
      .sort({ eventDate: -1 });

    res.json({ success: true, count: albums.length, albums });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAlbumById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const album = await EventGalleryAlbum.findById(id).populate('eventId');
    if (!album) {
      res.status(404).json({ success: false, message: 'Gallery album not found' });
      return;
    }
    res.json({ success: true, album });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getEventGallery = async (req: Request, res: Response): Promise<void> => {
  try {
    const { eventId } = req.params;
    const album = await EventGalleryAlbum.findOne({ eventId, isPublished: true });
    res.json({ success: true, album });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createAlbum = async (req: Request, res: Response): Promise<void> => {
  try {
    const { eventId, title, eventDate, description, category, coverMediaUrl, coverMediaType } =
      req.body;

    const album = await EventGalleryAlbum.create({
      eventId: eventId || undefined,
      title,
      eventDate: eventDate ? new Date(eventDate) : new Date(),
      description,
      category: category || 'WORKSHOP',
      coverMediaUrl: coverMediaUrl || '/assets/aces-team.jpg',
      coverMediaType: coverMediaType || 'IMAGE',
      media: [],
      isPublished: true,
    });

    res.status(201).json({ success: true, message: 'Gallery album created', album });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Upload image or video to an event gallery album using Cloudinary / persistent storage
 */
export const uploadMediaToAlbum = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const file = req.file;
    const { caption, altText, isFeatured } = req.body;

    if (!file) {
      res.status(400).json({ success: false, message: 'Media file is required' });
      return;
    }

    const album = await EventGalleryAlbum.findById(id);
    if (!album) {
      res.status(404).json({ success: false, message: 'Gallery album not found' });
      return;
    }

    // Upload to Cloudinary (or local fallback)
    const uploadResult = await uploadGalleryMedia(file, 'aces_event_gallery');
    const isVideo = file.mimetype.startsWith('video/');

    const newMediaItem = {
      url: uploadResult.url,
      publicId: uploadResult.publicId,
      mediaType: (isVideo ? 'VIDEO' : 'IMAGE') as 'IMAGE' | 'VIDEO',
      caption: caption || file.originalname,
      altText: altText || album.title,
      displayOrder: album.media.length + 1,
      isFeatured: isFeatured === 'true' || isFeatured === true,
    };

    album.media.push(newMediaItem as any);

    // If album doesn't have a custom cover or it's default, set this as cover
    if (!album.coverMediaUrl || album.coverMediaUrl === '/assets/aces-team.jpg') {
      album.coverMediaUrl = uploadResult.url;
      album.coverMediaType = newMediaItem.mediaType;
    }

    await album.save();

    res.status(201).json({
      success: true,
      message: `${isVideo ? 'Video' : 'Photo'} uploaded successfully via ${uploadResult.storageProvider}`,
      mediaItem: newMediaItem,
      album,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateAlbum = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updated = await EventGalleryAlbum.findByIdAndUpdate(id, req.body, { new: true });
    if (!updated) {
      res.status(404).json({ success: false, message: 'Album not found' });
      return;
    }
    res.json({ success: true, message: 'Album updated', album: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteAlbum = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const deleted = await EventGalleryAlbum.findByIdAndDelete(id);
    if (!deleted) {
      res.status(404).json({ success: false, message: 'Album not found' });
      return;
    }
    res.json({ success: true, message: 'Album deleted' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteMediaFromAlbum = async (req: Request, res: Response): Promise<void> => {
  try {
    const { albumId, mediaId } = req.params;
    const album = await EventGalleryAlbum.findById(albumId);
    if (!album) {
      res.status(404).json({ success: false, message: 'Album not found' });
      return;
    }

    album.media = album.media.filter((m: any) => m._id.toString() !== mediaId);
    await album.save();

    res.json({ success: true, message: 'Media removed from album', album });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Legacy/simple gallery items handler (backwards compatibility)
export const getGallery = async (req: Request, res: Response): Promise<void> => {
  try {
    const { category } = req.query;
    const filter: any = {};
    if (category && category !== 'ALL') {
      filter.category = category;
    }
    const items = await GalleryItem.find(filter).sort({ displayOrder: 1, date: -1 });
    res.json({ success: true, count: items.length, items });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
