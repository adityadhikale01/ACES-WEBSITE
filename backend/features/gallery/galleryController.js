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
  const { category } = req.query;
  const filter = { isPublished: true };
  if (category && category !== 'ALL') filter.category = category;

  const albums = await Album.find(filter).sort({ eventDate: -1, displayOrder: 1 });
  res.status(200).json({
    success: true,
    count: albums.length,
    albums,
  });
};

export const getAllAlbumsAdmin = async (req, res) => {
  const albums = await Album.find().sort({ eventDate: -1 });
  res.status(200).json({
    success: true,
    count: albums.length,
    albums,
  });
};

export const getAlbumById = async (req, res, next) => {
  const { id } = req.params;
  const album = await Album.findOne({
    $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { slug: id }],
  });

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
  const data = req.body;
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
  const data = req.body;

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

export const uploadMediaToAlbum = async (req, res, next) => {
  const { albumId } = req.params;
  const file = req.file;
  const { caption, altText, isFeatured } = req.body;

  if (!file) {
    return next(new AppError('Media file is required', 400));
  }

  const album = await Album.findById(albumId);
  if (!album) {
    return next(new AppError('Album not found', 404));
  }

  let mediaUrl = '';
  if (file.path && file.path.startsWith('http')) {
    mediaUrl = file.path;
  } else if (file.filename) {
    mediaUrl = `/uploads/public/media/${file.filename}`;
  }

  const isVideo = file.mimetype.startsWith('video/');

  const media = await MediaItem.create({
    albumId,
    url: mediaUrl,
    mediaType: isVideo ? 'VIDEO' : 'IMAGE',
    caption: caption || '',
    altText: altText || '',
    isFeatured: isFeatured === 'true' || isFeatured === true,
  });

  await Album.findByIdAndUpdate(albumId, {
    $inc: { mediaCount: 1 },
    ...(album.coverMediaUrl === '/assets/aces-team.jpg' && !isVideo ? { coverMediaUrl: mediaUrl } : {}),
  });

  res.status(201).json({
    success: true,
    message: 'Media uploaded to album',
    media,
    item: media,
  });
};

export const deleteMediaFromAlbum = async (req, res, next) => {
  const { albumId, mediaId } = req.params;
  const media = await MediaItem.findOneAndDelete({ _id: mediaId, albumId });
  if (!media) {
    return next(new AppError('Media item not found', 404));
  }

  await Album.findByIdAndUpdate(albumId, {
    $inc: { mediaCount: -1 },
  });

  res.status(200).json({
    success: true,
    message: 'Media deleted',
  });
};

export const getLegacyGallery = async (req, res) => {
  const media = await MediaItem.find().sort({ createdAt: -1 }).limit(30);
  res.status(200).json({
    success: true,
    count: media.length,
    items: media,
    galleryItems: media,
  });
};
