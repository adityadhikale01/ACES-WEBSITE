import { Album, MediaItem } from './galleryModel.js';
import { AppError } from '../../utils/AppError.js';

const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-');
};

export const getAllAlbums = async (req, res) => {
  const albums = await Album.find({ isPublished: true }).sort({ eventDate: -1 });
  res.status(200).json({
    success: true,
    count: albums.length,
    albums,
  });
};

export const getAlbumBySlug = async (req, res, next) => {
  const { slug } = req.params;
  const album = await Album.findOne({ slug });
  if (!album) {
    return next(new AppError('Album not found', 404));
  }

  const media = await MediaItem.find({ albumId: album._id }).sort({ displayOrder: 1, createdAt: 1 });

  res.status(200).json({
    success: true,
    album,
    media,
  });
};

export const createAlbum = async (req, res, next) => {
  const data = req.validatedBody || req.body;
  const slug = data.slug || slugify(data.title);

  const existing = await Album.findOne({ slug });
  if (existing) {
    return next(new AppError('An album with this title or slug already exists', 409));
  }

  const album = await Album.create({
    ...data,
    slug,
  });

  res.status(201).json({
    success: true,
    message: 'Album created successfully',
    album,
  });
};

export const updateAlbum = async (req, res, next) => {
  const { id } = req.params;
  const data = req.validatedBody || req.body;

  const album = await Album.findByIdAndUpdate(id, data, { new: true });
  if (!album) {
    return next(new AppError('Album not found', 404));
  }

  res.status(200).json({
    success: true,
    message: 'Album updated',
    album,
  });
};

export const deleteAlbum = async (req, res, next) => {
  const { id } = req.params;
  const album = await Album.findByIdAndDelete(id);
  if (!album) {
    return next(new AppError('Album not found', 404));
  }

  await MediaItem.deleteMany({ albumId: id });

  res.status(200).json({
    success: true,
    message: 'Album deleted',
  });
};

export const addMediaToAlbum = async (req, res) => {
  const data = req.validatedBody || req.body;
  const media = await MediaItem.create(data);

  await Album.findByIdAndUpdate(data.albumId, {
    $inc: { mediaCount: 1 },
  });

  res.status(201).json({
    success: true,
    message: 'Media added to album',
    media,
  });
};

export const deleteMediaItem = async (req, res, next) => {
  const { id } = req.params;
  const media = await MediaItem.findByIdAndDelete(id);
  if (!media) {
    return next(new AppError('Media not found', 404));
  }

  await Album.findByIdAndUpdate(media.albumId, {
    $inc: { mediaCount: -1 },
  });

  res.status(200).json({
    success: true,
    message: 'Media removed',
  });
};
