import { Request, Response } from 'express';
import { z } from 'zod';
import { ContactMessage } from '../models/ContactMessage.js';

export const contactSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Valid email is required'),
  subject: z.string().min(3, 'Subject is required'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});

export const submitContact = async (req: Request, res: Response): Promise<void> => {
  try {
    const message = await ContactMessage.create(req.body);
    res.status(201).json({
      success: true,
      message: 'Thank you for reaching out! The ACES team has received your message and will respond shortly.',
      messageId: message._id,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getContactMessages = async (_req: Request, res: Response): Promise<void> => {
  try {
    const messages = await ContactMessage.find().sort({ createdAt: -1 });
    res.json({ success: true, count: messages.length, messages });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const markMessageRead = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { isRead, notes } = req.body;
    const updated = await ContactMessage.findByIdAndUpdate(
      id,
      { isRead, notes, respondedAt: isRead ? new Date() : undefined },
      { new: true }
    );
    if (!updated) {
      res.status(404).json({ success: false, message: 'Message not found' });
      return;
    }
    res.json({ success: true, message: 'Message updated', record: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
