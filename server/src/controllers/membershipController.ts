import { Response } from 'express';
import { z } from 'zod';
import { MembershipApplication } from '../models/MembershipApplication.js';
import { User } from '../models/User.js';
import { AuthRequest } from '../middleware/auth.js';

export const applicationSchema = z.object({
  fullName: z.string().min(2, 'Name is required'),
  email: z.string().email('Valid email is required'),
  department: z.string().default('Computer Engineering'),
  academicYear: z.string().min(1, 'Academic year is required'),
  prnOrRoll: z.string().optional(),
  areasOfInterest: z.array(z.string()).min(1, 'Select at least one area of interest'),
  reasonForJoining: z.string().min(15, 'Please share your motivation for joining ACES (min 15 characters)'),
});

export const submitApplication = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { fullName, email, department, academicYear, prnOrRoll, areasOfInterest, reasonForJoining } =
      req.body;

    const normalizedEmail = email.toLowerCase().trim();

    // Check if an application is already pending or approved
    const existing = await MembershipApplication.findOne({
      email: normalizedEmail,
      status: { $in: ['PENDING', 'APPROVED'] },
    });

    if (existing) {
      res.status(409).json({
        success: false,
        message:
          existing.status === 'APPROVED'
            ? 'You are already an approved member of ACES!'
            : 'You have a pending membership application under review. Please check your dashboard for updates.',
        application: existing,
      });
      return;
    }

    const application = await MembershipApplication.create({
      userId: req.user?._id,
      fullName,
      email: normalizedEmail,
      department,
      academicYear,
      prnOrRoll,
      areasOfInterest,
      reasonForJoining,
      status: 'PENDING',
    });

    res.status(201).json({
      success: true,
      message: 'Membership application submitted successfully! Our committee will review your submission.',
      application,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getMyApplication = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const application = await MembershipApplication.findOne({
      $or: [{ userId: req.user._id }, { email: req.user.email.toLowerCase() }],
    }).sort({ createdAt: -1 });

    res.json({ success: true, application });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllApplications = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status, search } = req.query;
    const filter: any = {};

    if (status && status !== 'ALL') {
      filter.status = status;
    }

    if (search) {
      filter.$or = [
        { fullName: { $regex: search as string, $options: 'i' } },
        { email: { $regex: search as string, $options: 'i' } },
        { department: { $regex: search as string, $options: 'i' } },
      ];
    }

    const applications = await MembershipApplication.find(filter)
      .populate('userId', 'fullName email')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: applications.length, applications });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const reviewApplication = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, adminNotes } = req.body;

    if (!['APPROVED', 'REJECTED'].includes(status)) {
      res.status(400).json({ success: false, message: 'Status must be APPROVED or REJECTED' });
      return;
    }

    const application = await MembershipApplication.findById(id);
    if (!application) {
      res.status(404).json({ success: false, message: 'Application not found' });
      return;
    }

    application.status = status;
    application.adminNotes = adminNotes;
    application.reviewedBy = req.user?.fullName || 'ACES Admin';
    application.reviewedAt = new Date();
    await application.save();

    // If approved, update user membership flag
    if (status === 'APPROVED') {
      await User.findOneAndUpdate(
        { email: application.email.toLowerCase() },
        { isApprovedMember: true, role: 'MEMBER' }
      );
    }

    res.json({
      success: true,
      message: `Application has been ${status.toLowerCase()}!`,
      application,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
