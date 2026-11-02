import Event from './eventModel.js';
import { AppError } from '../../utils/AppError.js';
import { saveUploadedFile } from '../../utils/fileStorage.js';

const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-');
};

export const uploadEventPoster = async (req, res, next) => {
  const file = req.file || (req.files && req.files[0]);
  if (!file) {
    return next(new AppError('No poster file uploaded. Please attach an image file.', 400));
  }

  try {
    const customName = `poster_${Date.now()}`;
    const posterUrl = await saveUploadedFile(file, 'posters', customName);

    res.status(200).json({
      success: true,
      message: 'Event poster uploaded successfully',
      posterUrl,
      url: posterUrl,
    });
  } catch (err) {
    next(err);
  }
};

export const uploadPaymentQr = async (req, res, next) => {
  const file = req.file || (req.files && req.files[0]);
  if (!file) {
    return next(new AppError('No payment QR image uploaded. Please attach an image file.', 400));
  }

  try {
    const customName = `payment_qr_${Date.now()}`;
    const paymentQrUrl = await saveUploadedFile(file, 'payments', customName);

    res.status(200).json({
      success: true,
      message: 'Payment UPI QR code uploaded successfully',
      paymentQrUrl,
      url: paymentQrUrl,
    });
  } catch (err) {
    next(err);
  }
};

export const getAllEvents = async (req, res) => {
  const { category, isPaid, status, search, featured } = req.query;
  const filter = {};

  if (category && category !== 'ALL') filter.category = category;
  if (isPaid !== undefined && isPaid !== '') filter.isPaid = isPaid === 'true';
  if (status && status.toUpperCase() !== 'ALL') {
    filter.status = status;
  } else if (!status) {
    filter.status = 'PUBLISHED';
  }
  if (featured === 'true') filter.isFeatured = true;

  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { shortDescription: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ];
  }

  const events = await Event.find(filter).sort({ startDate: -1, eventDate: -1, createdAt: -1 });

  res.status(200).json({
    success: true,
    count: events.length,
    events,
  });
};

export const getEventBySlug = async (req, res, next) => {
  const { slug } = req.params;
  const event = await Event.findOne({
    $or: [{ slug }, { _id: slug.match(/^[0-9a-fA-F]{24}$/) ? slug : null }],
  });
  if (!event) {
    return next(new AppError(`Event not found with slug/id: ${slug}`, 404));
  }

  res.status(200).json({
    success: true,
    event,
  });
};

export const createEvent = async (req, res, next) => {
  const eventData = req.validatedBody || req.body;
  let slug = eventData.slug || slugify(eventData.title);

  // Auto-suffix if duplicate slug exists so admin is never blocked with a 409
  const existing = await Event.findOne({ slug });
  if (existing) {
    slug = `${slug}-${Date.now().toString().slice(-4)}`;
  }

  const fee = eventData.fee !== undefined ? eventData.fee : eventData.feeAmountInPaise || 0;

  // Safe date parsing
  let startDate = new Date();
  if (eventData.startDate) {
    const parsed = new Date(eventData.startDate);
    if (!isNaN(parsed.getTime())) startDate = parsed;
  } else if (eventData.eventDate) {
    const parsed = new Date(eventData.eventDate);
    if (!isNaN(parsed.getTime())) startDate = parsed;
  }

  let registrationDeadline = null;
  if (eventData.registrationDeadline) {
    const parsed = new Date(eventData.registrationDeadline);
    if (!isNaN(parsed.getTime())) registrationDeadline = parsed;
  }

  let endDate = null;
  if (eventData.endDate) {
    const parsed = new Date(eventData.endDate);
    if (!isNaN(parsed.getTime())) endDate = parsed;
  }

  const eventCode = (eventData.eventCode || slug).toUpperCase().replace(/[^A-Z0-9_-]/g, '-').slice(0, 16);
  const paymentQrUrl = eventData.paymentQrUrl || eventData.upiQrCodeUrl || '';
  const upiQrCodeUrl = paymentQrUrl;
  const paymentUpiId = eventData.paymentUpiId || eventData.upiId || 'aces.kbtcoe@upi';
  const upiId = paymentUpiId;

  const newEvent = await Event.create({
    ...eventData,
    slug,
    eventCode,
    paymentQrUrl,
    upiQrCodeUrl,
    paymentUpiId,
    upiId,
    fee,
    feeAmountInPaise: fee,
    startDate,
    eventDate: startDate,
    registrationDeadline,
    endDate,
    capacity: eventData.capacity !== undefined ? eventData.capacity : eventData.maxCapacity,
    maxCapacity: eventData.maxCapacity !== undefined ? eventData.maxCapacity : eventData.capacity,
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

  if (eventData.fee !== undefined) eventData.feeAmountInPaise = eventData.fee;
  if (eventData.feeAmountInPaise !== undefined) eventData.fee = eventData.feeAmountInPaise;

  if (eventData.paymentQrUrl !== undefined) {
    eventData.upiQrCodeUrl = eventData.paymentQrUrl;
  }
  if (eventData.upiQrCodeUrl !== undefined && !eventData.paymentQrUrl) {
    eventData.paymentQrUrl = eventData.upiQrCodeUrl;
  }
  if (eventData.paymentUpiId !== undefined) {
    eventData.upiId = eventData.paymentUpiId;
  }

  if (eventData.startDate) {
    const parsed = new Date(eventData.startDate);
    if (!isNaN(parsed.getTime())) {
      eventData.startDate = parsed;
      eventData.eventDate = parsed;
    }
  }
  if (eventData.registrationDeadline) {
    const parsed = new Date(eventData.registrationDeadline);
    if (!isNaN(parsed.getTime())) eventData.registrationDeadline = parsed;
  }
  if (eventData.endDate) {
    const parsed = new Date(eventData.endDate);
    if (!isNaN(parsed.getTime())) eventData.endDate = parsed;
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
