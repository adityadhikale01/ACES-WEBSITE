import { Response } from 'express';
import { PaymentSubmission } from '../models/PaymentSubmission.js';
import { EventRegistration } from '../models/EventRegistration.js';
import { Event } from '../models/Event.js';
import { AuthRequest } from '../middleware/auth.js';
import {
  storePrivatePaymentScreenshot,
  getPrivateScreenshotPath,
} from '../services/storageService.js';
import fs from 'fs';

export const submitPaymentProof = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const { registrationId, utrReference } = req.body;
    const file = req.file;

    if (!registrationId) {
      res.status(400).json({ success: false, message: 'registrationId is required' });
      return;
    }

    if (!utrReference || utrReference.trim().length < 4) {
      res.status(400).json({
        success: false,
        message: 'Valid Transaction Reference or UTR is required (min 4 characters)',
      });
      return;
    }

    if (!file) {
      res.status(400).json({
        success: false,
        message: 'Payment screenshot/receipt image is required',
      });
      return;
    }

    // Verify ownership and registration existence
    const registration = await EventRegistration.findById(registrationId);
    if (!registration) {
      res.status(404).json({ success: false, message: 'Registration not found' });
      return;
    }

    if (registration.userId.toString() !== req.user._id.toString() && req.user.role !== 'ADMIN') {
      res.status(403).json({
        success: false,
        message: 'Access denied: You can only submit payment proof for your own registration',
      });
      return;
    }

    // Verify event pricing and payment status
    const event = await Event.findById(registration.eventId);
    if (!event) {
      res.status(404).json({ success: false, message: 'Event not found' });
      return;
    }

    if (!event.isPaid || event.fee <= 0) {
      res.status(400).json({
        success: false,
        message: 'This event is free of charge. No payment verification required.',
      });
      return;
    }

    // Check duplicate UTR across verified submissions
    const existingUtr = await PaymentSubmission.findOne({
      utrReference: utrReference.trim(),
      status: { $in: ['VERIFIED', 'PROOF_SUBMITTED', 'UNDER_REVIEW'] },
      registrationId: { $ne: registration._id },
    });

    if (existingUtr) {
      res.status(409).json({
        success: false,
        message: 'This transaction reference (UTR) has already been submitted for another registration.',
      });
      return;
    }

    // Store screenshot securely in private storage
    const uploadResult = await storePrivatePaymentScreenshot(file);

    // Expected amount must be calculated from trusted server event pricing
    const expectedAmount = event.fee;

    // Check if there is already a submission for this registration
    let submission = await PaymentSubmission.findOne({ registrationId: registration._id });

    if (submission) {
      submission.utrReference = utrReference.trim();
      submission.screenshotKey = uploadResult.publicId || uploadResult.url;
      submission.screenshotMimeType = file.mimetype;
      submission.submissionTimestamp = new Date();
      submission.status = 'PROOF_SUBMITTED';
      submission.rejectionReason = undefined;
      submission.auditHistory.push({
        action: 'RESUBMITTED_PROOF',
        performedBy: req.user.fullName,
        timestamp: new Date(),
        notes: `Resubmitted with UTR: ${utrReference.trim()}`,
      });
      await submission.save();
    } else {
      submission = await PaymentSubmission.create({
        registrationId: registration._id,
        userId: req.user._id,
        eventId: event._id,
        expectedAmount,
        currency: 'INR',
        utrReference: utrReference.trim(),
        screenshotKey: uploadResult.publicId || uploadResult.url,
        screenshotMimeType: file.mimetype,
        submissionTimestamp: new Date(),
        status: 'PROOF_SUBMITTED',
        auditHistory: [
          {
            action: 'SUBMITTED_PROOF',
            performedBy: req.user.fullName,
            timestamp: new Date(),
            notes: `Initial submission with UTR: ${utrReference.trim()}`,
          },
        ],
      });
    }

    // Update registration payment status
    registration.paymentStatus = 'PROOF_SUBMITTED';
    registration.paymentSubmissionId = submission._id as any;
    registration.amountDue = expectedAmount;
    await registration.save();

    res.status(201).json({
      success: true,
      message: 'Payment proof submitted successfully! Awaiting administrative verification.',
      submission,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getMyPayments = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const submissions = await PaymentSubmission.find({ userId: req.user._id })
      .populate('eventId', 'title fee isPaid')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: submissions.length, submissions });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllPaymentsAdmin = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status, eventId, search } = req.query;
    const filter: any = {};

    if (status && status !== 'ALL') {
      filter.status = status;
    }

    if (eventId) {
      filter.eventId = eventId;
    }

    if (search) {
      filter.utrReference = { $regex: search as string, $options: 'i' };
    }

    const submissions = await PaymentSubmission.find(filter)
      .populate('userId', 'fullName email phone department academicYear')
      .populate('eventId', 'title fee isPaid slug')
      .sort({ submissionTimestamp: -1 });

    res.json({ success: true, count: submissions.length, submissions });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Secure screenshot proxy: Only the owner student or an admin can view the screenshot.
 */
export const getPaymentScreenshot = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const { id } = req.params;
    const submission = await PaymentSubmission.findById(id);

    if (!submission) {
      res.status(404).json({ success: false, message: 'Payment record not found' });
      return;
    }

    // IDOR protection
    const isOwner = submission.userId.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'ADMIN';

    if (!isOwner && !isAdmin) {
      res.status(403).json({
        success: false,
        message: 'Access forbidden: You cannot view another student’s payment proof',
      });
      return;
    }

    const filePath = getPrivateScreenshotPath(submission.screenshotKey);
    if (!filePath || !fs.existsSync(filePath)) {
      res.status(404).json({ success: false, message: 'Screenshot file not found on storage' });
      return;
    }

    res.setHeader('Content-Type', submission.screenshotMimeType || 'image/jpeg');
    res.setHeader('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    const readStream = fs.createReadStream(filePath);
    readStream.pipe(res);
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Admin Action: Approve, Reject, or Request Resubmission.
 * Mandatory rejection reason when rejected.
 */
export const reviewPaymentProof = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, rejectionReason, adminNotes } = req.body;

    if (!['VERIFIED', 'REJECTED', 'RESUBMISSION_REQUESTED'].includes(status)) {
      res.status(400).json({
        success: false,
        message: 'Status must be VERIFIED, REJECTED, or RESUBMISSION_REQUESTED',
      });
      return;
    }

    if ((status === 'REJECTED' || status === 'RESUBMISSION_REQUESTED') && !rejectionReason?.trim()) {
      res.status(400).json({
        success: false,
        message: 'A mandatory rejection reason is required when rejecting payment proof.',
      });
      return;
    }

    const submission = await PaymentSubmission.findById(id);
    if (!submission) {
      res.status(404).json({ success: false, message: 'Payment submission not found' });
      return;
    }

    const actingAdmin = req.user?.fullName || 'ACES Admin';

    submission.status = status;
    submission.adminDecisionBy = actingAdmin;
    submission.adminNotes = adminNotes;
    submission.rejectionReason = rejectionReason;
    if (status === 'VERIFIED') {
      submission.verifiedAt = new Date();
    }

    submission.auditHistory.push({
      action: status === 'VERIFIED' ? 'PAYMENT_VERIFIED' : `PAYMENT_${status}`,
      performedBy: actingAdmin,
      timestamp: new Date(),
      notes: rejectionReason || adminNotes || 'Verified against bank records',
    });

    await submission.save();

    // Update associated EventRegistration
    const registration = await EventRegistration.findById(submission.registrationId);
    if (registration) {
      registration.paymentStatus = status;
      if (status === 'VERIFIED') {
        registration.status = 'REGISTERED'; // Confirm seat
      }
      await registration.save();
    }

    res.json({
      success: true,
      message: `Payment proof marked as ${status}!`,
      submission,
      registration,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
