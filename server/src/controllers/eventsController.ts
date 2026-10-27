import { Response } from 'express';
import { z } from 'zod';
import { Event } from '../models/Event.js';
import { EventRegistration } from '../models/EventRegistration.js';
import { AuthRequest } from '../middleware/auth.js';

export const eventSchema = z.object({
  title: z.string().min(3, 'Title is required'),
  slug: z.string().min(3, 'Valid URL slug is required'),
  subtitle: z.string().optional(),
  description: z.string().min(10, 'Detailed description is required'),
  category: z.enum([
    'FLAGSHIP',
    'WORKSHOP',
    'CODING',
    'DEVELOPMENT',
    'CHALLENGE',
    'COMMUNITY',
    'MEETUP',
    'SEMINAR',
    'TECHFEST',
  ]),
  posterUrl: z.string().optional(),
  venue: z.string().default('Seminar Hall, KBTCOE'),
  isOnline: z.boolean().default(false),
  meetingLink: z.string().optional(),
  startDate: z.string().or(z.date()),
  endDate: z.string().or(z.date()).optional(),
  timeString: z.string().default('10:00 AM'),
  registrationDeadline: z.string().or(z.date()),
  capacity: z.number().nullable().optional(),
  eligibility: z.enum(['OPEN_TO_ALL', 'MEMBERS_ONLY', 'DEPARTMENT_ONLY']).default('OPEN_TO_ALL'),
  status: z.enum(['DRAFT', 'PUBLISHED', 'CANCELLED', 'COMPLETED']).default('PUBLISHED'),
  isFeatured: z.boolean().default(false),
  organizerInfo: z.string().default('ACES KBTCOE Committee'),

  // Paid event configurations
  isPaid: z.boolean().default(false),
  fee: z.number().default(0), // in integer paise (e.g. 15000 = Rs. 150)
  paymentInstructions: z.string().optional(),
  paymentUpiId: z.string().optional(),
  paymentQrUrl: z.string().optional(),
  refundPolicy: z.string().optional(),
  paymentDeadline: z.string().or(z.date()).optional(),
});

export const getEvents = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { category, status, search, featured } = req.query;
    const filter: any = {};

    // Visitors only see PUBLISHED events; Admins can see all statuses
    const isAdmin = req.user?.role === 'ADMIN';
    if (!isAdmin) {
      filter.status = 'PUBLISHED';
    } else if (status) {
      filter.status = status;
    }

    if (category && category !== 'ALL') {
      filter.category = category;
    }

    if (featured === 'true') {
      filter.isFeatured = true;
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search as string, $options: 'i' } },
        { subtitle: { $regex: search as string, $options: 'i' } },
        { description: { $regex: search as string, $options: 'i' } },
      ];
    }

    const events = await Event.find(filter).sort({ startDate: 1 });
    res.json({ success: true, count: events.length, events });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getEventBySlug = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { slug } = req.params;
    const event = await Event.findOne({ slug });

    if (!event) {
      res.status(404).json({ success: false, message: 'Event not found' });
      return;
    }

    // Check if current user is registered for this event
    let isRegistered = false;
    let userRegistration = null;

    if (req.user) {
      userRegistration = await EventRegistration.findOne({
        eventId: event._id,
        userId: req.user._id,
        status: { $in: ['REGISTERED', 'WAITLISTED', 'ATTENDED'] },
      }).populate('paymentSubmissionId');
      isRegistered = !!userRegistration;
    }

    res.json({
      success: true,
      event,
      userRegistrationStatus: {
        isRegistered,
        registration: userRegistration,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createEvent = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const existing = await Event.findOne({ slug: req.body.slug });
    if (existing) {
      res.status(409).json({ success: false, message: 'An event with this URL slug already exists.' });
      return;
    }

    const event = await Event.create(req.body);
    res.status(201).json({ success: true, message: 'Event created successfully!', event });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateEvent = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updated = await Event.findByIdAndUpdate(id, req.body, { new: true });

    if (!updated) {
      res.status(404).json({ success: false, message: 'Event not found' });
      return;
    }

    res.json({ success: true, message: 'Event updated successfully!', event: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteEvent = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const deleted = await Event.findByIdAndDelete(id);

    if (!deleted) {
      res.status(404).json({ success: false, message: 'Event not found' });
      return;
    }

    // Also remove associated registrations
    await EventRegistration.deleteMany({ eventId: id });

    res.json({ success: true, message: 'Event and associated registrations deleted successfully.' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
