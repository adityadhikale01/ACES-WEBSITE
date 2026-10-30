import ContactMessage from './contactModel.js';
import { AppError } from '../../utils/AppError.js';

export const submitContact = async (req, res) => {
  const data = req.validatedBody || req.body;
  const message = await ContactMessage.create(data);

  res.status(201).json({
    success: true,
    message: 'Your inquiry has been received. ACES team will respond shortly.',
    data: { id: message._id },
  });
};

export const getAllMessages = async (req, res) => {
  const { resolved } = req.query;
  const filter = {};
  if (resolved !== undefined) {
    filter.isResolved = resolved === 'true';
  }

  const messages = await ContactMessage.find(filter).sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: messages.length,
    messages,
  });
};

export const markResolved = async (req, res, next) => {
  const { id } = req.params;
  const { isResolved, isRead, notes } = req.body;

  const update = {};
  if (isResolved !== undefined) {
    update.isResolved = Boolean(isResolved);
    update.resolvedAt = isResolved ? new Date() : null;
  }
  if (isRead !== undefined) {
    update.isRead = Boolean(isRead);
  } else {
    update.isRead = true;
  }
  if (notes !== undefined) {
    update.notes = notes;
  }

  const msg = await ContactMessage.findByIdAndUpdate(id, update, { new: true });

  if (!msg) {
    return next(new AppError('Message not found', 404));
  }

  res.status(200).json({
    success: true,
    message: 'Message status updated',
    data: msg,
    messageItem: msg,
  });
};
