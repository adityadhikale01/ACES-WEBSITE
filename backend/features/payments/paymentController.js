import PaymentProof from './paymentModel.js';
import Registration from '../registrations/registrationModel.js';
import Event from '../events/eventModel.js';
import { AppError } from '../../utils/AppError.js';

export const submitPaymentProof = async (req, res, next) => {
  const { registrationId, utrNumber, utrReference, payerUpiId } = req.body;
  const utr = utrNumber || utrReference;
  const file = req.file;

  if (!registrationId) {
    return next(new AppError('registrationId is required', 400));
  }

  if (!utr) {
    return next(new AppError('Transaction Reference / UTR number is required', 400));
  }

  const registration = await Registration.findById(registrationId).populate('eventId');
  if (!registration) {
    return next(new AppError('Registration not found', 404));
  }

  if (registration.userId && req.userId && registration.userId.toString() !== req.userId && !['SUPER_ADMIN', 'ADMIN', 'PRESIDENT'].includes(req.user?.role)) {
    return next(new AppError('Unauthorized access to registration', 403));
  }

  const event = registration.eventId;
  if (!event || !event.isPaid) {
    return next(new AppError('This event does not require payment', 400));
  }

  let receiptData = null;
  let receiptMimeType = file?.mimetype || 'image/png';
  let receiptUrl = null;

  if (file) {
    if (file.buffer) {
      receiptData = file.buffer;
    } else if (file.path) {
      receiptUrl = file.path;
    }
  }

  const amount = event.fee || event.feeAmountInPaise || 0;

  const paymentProof = await PaymentProof.create({
    registrationId,
    eventId: event._id,
    userId: req.userId,
    amountInPaise: amount,
    expectedAmount: amount,
    utrNumber: utr,
    utrReference: utr,
    payerUpiId,
    receiptData,
    receiptMimeType,
    receiptUrl,
    verificationStatus: 'PROOF_SUBMITTED',
    status: 'PROOF_SUBMITTED',
  });

  await Registration.findByIdAndUpdate(registrationId, {
    paymentStatus: 'PROOF_SUBMITTED',
    paymentSubmissionId: paymentProof._id,
  });

  res.status(201).json({
    success: true,
    message: 'Payment proof submitted successfully! Verification pending by ACES coordinators.',
    paymentProof,
    submission: paymentProof,
  });
};

export const getMyPayments = async (req, res) => {
  const payments = await PaymentProof.find({ userId: req.userId })
    .populate('eventId')
    .populate('registrationId')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: payments.length,
    payments,
    submissions: payments,
  });
};

export const getPaymentScreenshot = async (req, res, next) => {
  const { id } = req.params;
  const payment = await PaymentProof.findById(id);
  if (!payment) {
    return next(new AppError('Payment proof not found', 404));
  }

  const isOwner = payment.userId ? payment.userId.toString() === req.userId : false;
  const isAdmin = ['SUPER_ADMIN', 'ADMIN', 'PRESIDENT'].includes(req.user?.role);
  if (!isOwner && !isAdmin) {
    return next(new AppError('Access forbidden: You cannot view this payment receipt', 403));
  }

  if (payment.receiptData && payment.receiptData.length > 0) {
    res.setHeader('Content-Type', payment.receiptMimeType || 'image/png');
    return res.status(200).send(payment.receiptData);
  }

  if (payment.receiptUrl) {
    return res.redirect(payment.receiptUrl);
  }

  return res.status(404).json({ success: false, message: 'Screenshot data unavailable' });
};

export const getAllPaymentsAdmin = async (req, res) => {
  const { status, search } = req.query;
  const filter = {};
  if (status && status !== 'ALL') {
    filter.$or = [{ verificationStatus: status }, { status }];
  }

  let payments = await PaymentProof.find(filter)
    .populate('userId', 'fullName name email prn department phone')
    .populate('eventId', 'title slug fee feeAmountInPaise')
    .populate('registrationId')
    .sort({ createdAt: -1 });

  if (search) {
    const s = search.toLowerCase();
    payments = payments.filter(
      (p) =>
        p.utrNumber?.toLowerCase().includes(s) ||
        p.utrReference?.toLowerCase().includes(s) ||
        p.userId?.fullName?.toLowerCase().includes(s) ||
        p.userId?.name?.toLowerCase().includes(s) ||
        p.userId?.email?.toLowerCase().includes(s) ||
        p.eventId?.title?.toLowerCase().includes(s)
    );
  }

  res.status(200).json({
    success: true,
    count: payments.length,
    payments,
    submissions: payments,
  });
};

export const reviewPaymentProof = async (req, res, next) => {
  const { id } = req.params;
  const { status, rejectionReason, adminNotes } = req.body;

  const payment = await PaymentProof.findById(id);
  if (!payment) {
    return next(new AppError('Payment record not found', 404));
  }

  const isApproved = status === 'VERIFIED' || status === 'APPROVED';
  const newStatus = isApproved ? 'VERIFIED' : status;

  payment.verificationStatus = newStatus;
  payment.status = newStatus;
  payment.verifiedBy = req.userId;
  payment.adminDecisionBy = req.user.fullName || req.user.name;
  payment.verifiedAt = new Date();
  payment.adminNotes = adminNotes || '';

  if (!isApproved) {
    payment.rejectionReason = rejectionReason || 'Payment proof was unclear or mismatched.';
  }

  await payment.save();

  if (isApproved) {
    await Registration.findByIdAndUpdate(payment.registrationId, {
      status: 'REGISTERED',
      paymentStatus: 'VERIFIED',
    });
    await Event.findByIdAndUpdate(payment.eventId, {
      $inc: { registrationCount: 1, registeredCount: 1 },
    });
  } else {
    await Registration.findByIdAndUpdate(payment.registrationId, {
      paymentStatus: 'REJECTED',
    });
  }

  res.status(200).json({
    success: true,
    message: `Payment proof marked as ${newStatus}`,
    payment,
    submission: payment,
  });
};
