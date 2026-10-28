import Event from './eventModel.js';
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

export const getAllEvents = async (req, res) => {
  const { category, isPaid, status = 'PUBLISHED', search } = req.query;
  const filter = {};

  if (category) filter.category = category;
  if (isPaid !== undefined) filter.isPaid = isPaid === 'true';
  if (status && status !== 'ALL') filter.status = status;
  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { shortDescription: { $regex: search, $options: 'i' } },
    ];
  }

  const events = await Event.find(filter).sort({ eventDate: 1 });

  res.status(200).json({
    success: true,
    count: events.length,
    events,
  });
};

export const getEventBySlug = async (req, res, next) => {
  const { slug } = req.params;
  const event = await Event.findOne({ slug });
  if (!event) {
    return next(new AppError(`Event not found with slug: ${slug}`, 404));
  }

  res.status(200).json({
    success: true,
    event,
  });
};

export const createEvent = async (req, res, next) => {
  const eventData = req.validatedBody || req.body;
  const slug = eventData.slug || slugify(eventData.title);

  const existing = await Event.findOne({ slug });
  if (existing) {
    return next(new AppError('An event with this title or slug already exists', 409));
  }

  const newEvent = await Event.create({
    ...eventData,
    slug,
    createdBy: req.userId,
  });

  res.status(201).json({
    success: true,
    message: 'Event created successfully',
    event: newEvent,
  });
};

export const updateEvent = async (req, res, next) => {
  const { id } = req.params;
  const eventData = req.validatedBody || req.body;

  const event = await Event.findById(id);
  if (!event) {
    return next(new AppError('Event not found', 404));
  }

  if (eventData.title && eventData.title !== event.title && !eventData.slug) {
    eventData.slug = slugify(eventData.title);
  }

  const updated = await Event.findByIdAndUpdate(id, eventData, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    message: 'Event updated successfully',
    event: updated,
  });
};

export const deleteEvent = async (req, res, next) => {
  const { id } = req.params;
  const event = await Event.findByIdAndDelete(id);
  if (!event) {
    return next(new AppError('Event not found', 404));
  }

  res.status(200).json({
    success: true,
    message: 'Event deleted successfully',
  });
};
