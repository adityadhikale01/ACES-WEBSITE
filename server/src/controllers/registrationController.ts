import { Response } from 'express';
import { z } from 'zod';
import { Event } from '../models/Event.js';
import { EventRegistration } from '../models/EventRegistration.js';
import { AuthRequest } from '../middleware/auth.js';

export const registerEventSchema = z.object({
  eventId: z.string().min(1, 'Event ID is required'),
  phone: z.string().optional(),
  academicYear: z.string().default('SE'),
  notes: z.string().optional(),
});

export const registerForEvent = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Please log in to register for events.' });
      return;
    }

    const { eventId, phone, academicYear, notes } = req.body;
    const user = req.user;

    const event = await Event.findById(eventId);
    if (!event) {
      res.status(404).json({ success: false, message: 'Event not found.' });
      return;
    }

    if (event.status !== 'PUBLISHED') {
      res.status(400).json({ success: false, message: 'This event is not open for registration.' });
      return;
    }

    // Check registration deadline
    if (new Date() > new Date(event.registrationDeadline)) {
      res.status(400).json({ success: false, message: 'Registration for this event has closed.' });
      return;
    }

    // Check eligibility
    if (event.eligibility === 'MEMBERS_ONLY' && !user.isApprovedMember && user.role !== 'ADMIN') {
      res.status(403).json({
        success: false,
        message: 'This event is restricted to approved ACES Club Members. Please apply for membership on the Join page.',
      });
      return;
    }

    // Check if user already registered
    const existingRegistration = await EventRegistration.findOne({
      eventId: event._id,
      userId: user._id,
      status: { $in: ['REGISTERED', 'WAITLISTED', 'ATTENDED'] },
    });

    if (existingRegistration) {
      res.status(409).json({ success: false, message: 'You are already registered for this event!' });
      return;
    }

    // Enforce capacity safely
    if (event.capacity !== null && event.capacity !== undefined) {
      const currentActiveCount = await EventRegistration.countDocuments({
        eventId: event._id,
        status: { $in: ['REGISTERED', 'ATTENDED'] },
      });

      if (currentActiveCount >= event.capacity) {
        res.status(400).json({
          success: false,
          message: 'Sorry, this event has reached its maximum seat capacity.',
        });
        return;
      }
    }

    const isPaid = Boolean(event.isPaid && event.fee > 0);

    const registration = await EventRegistration.create({
      eventId: event._id,
      userId: user._id,
      fullName: user.fullName,
      email: user.email,
      phone: phone || user.phone,
      department: user.department || 'Computer Engineering',
      academicYear: academicYear || user.academicYear || 'SE',
      registrationDate: new Date(),
      status: isPaid ? 'WAITLISTED' : 'REGISTERED',
      isPaidEvent: isPaid,
      amountDue: isPaid ? event.fee : 0,
      paymentStatus: isPaid ? 'AWAITING_PAYMENT' : 'FREE',
      notes,
    });

    // Increment registered count on the event
    await Event.findByIdAndUpdate(event._id, { $inc: { registeredCount: 1 } });

    res.status(201).json({
      success: true,
      message: isPaid
        ? 'Registration created! Please submit payment proof to confirm your seat.'
        : 'Registration successful! See you at the event.',
      registration,
      isPaidEvent: isPaid,
      amountDue: event.fee,
      paymentInstructions: event.paymentInstructions,
      paymentUpiId: event.paymentUpiId,
      paymentQrUrl: event.paymentQrUrl,
    });
  } catch (error: any) {
    if (error.code === 11000) {
      res.status(409).json({ success: false, message: 'You are already registered for this event.' });
      return;
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

export const cancelRegistration = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const { id } = req.params;
    const registration = await EventRegistration.findOne({
      _id: id,
      userId: req.user._id,
      status: { $in: ['REGISTERED', 'WAITLISTED'] },
    });

    if (!registration) {
      res.status(404).json({ success: false, message: 'Active registration not found' });
      return;
    }

    registration.status = 'CANCELLED';
    registration.paymentStatus = 'CANCELLED';
    await registration.save();

    await Event.findByIdAndUpdate(registration.eventId, { $inc: { registeredCount: -1 } });

    res.json({ success: true, message: 'Registration cancelled successfully.' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getMyRegistrations = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const registrations = await EventRegistration.find({ userId: req.user._id })
      .populate('eventId')
      .populate('paymentSubmissionId')
      .sort({ registrationDate: -1 });

    res.json({ success: true, count: registrations.length, registrations });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getEventAttendees = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { eventId } = req.params;
    const registrations = await EventRegistration.find({ eventId })
      .populate('userId', 'fullName email phone department academicYear')
      .populate('paymentSubmissionId')
      .sort({ registrationDate: 1 });

    res.json({ success: true, count: registrations.length, attendees: registrations });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const exportAttendeesCSV = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { eventId } = req.params;
    const event = await Event.findById(eventId);
    const registrations = await EventRegistration.find({ eventId })
      .populate('paymentSubmissionId')
      .sort({ registrationDate: 1 });

    let csv =
      'Full Name,Email,Phone,Department,Academic Year,Status,Payment Status,Amount Due (INR),UTR Reference,Registration Date\n';

    registrations.forEach((reg: any) => {
      const utr = reg.paymentSubmissionId?.utrReference || 'N/A';
      const feeInr = (reg.amountDue / 100).toFixed(2);
      csv += `"${reg.fullName}","${reg.email}","${reg.phone || ''}","${reg.department}","${reg.academicYear}","${reg.status}","${reg.paymentStatus}","${feeInr}","${utr}","${reg.registrationDate.toISOString()}"\n`;
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${event?.slug || 'event'}-attendees.csv"`
    );
    res.send(csv);
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateAttendance = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const updated = await EventRegistration.findByIdAndUpdate(id, { status }, { new: true });

    if (!updated) {
      res.status(404).json({ success: false, message: 'Registration record not found' });
      return;
    }

    res.json({ success: true, message: 'Attendance status updated', registration: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
