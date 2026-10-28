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
  const { isResolved } = req.body;

  const msg = await ContactMessage.findByIdAndUpdate(
    id,
    {
      isResolved: Boolean(isResolved),
      resolvedAt: isResolved ? new Date() : null,
      isRead: true,
    },
    { new: true }
  );

  if (!msg) {
    return next(new AppError('Message not found', 404));
  }

  res.status(200).json({
    success: true,
    message: `Message marked as ${isResolved ? 'resolved' : 'pending'}`,
    data: msg,
  });
};
