import PaymentProof from './paymentModel.js';
import Registration from '../registrations/registrationModel.js';
import Event from '../events/eventModel.js';
import { AppError } from '../../utils/AppError.js';

export const submitPaymentProof = async (req, res, next) => {
  const { registrationId, utrNumber, payerUpiId } = req.validatedBody || req.body;
  const file = req.file;

  const registration = await Registration.findById(registrationId).populate('eventId');
  if (!registration) {
    return next(new AppError('Registration not found', 404));
  }

  if (registration.userId.toString() !== req.userId && !['SUPER_ADMIN', 'ADMIN', 'PRESIDENT'].includes(req.user.role)) {
    return next(new AppError('Unauthorized access to registration', 403));
  }

  const event = registration.eventId;
  if (!event || !event.isPaid) {
    return next(new AppError('This event does not require payment', 400));
  }

  let receiptData = null;
  let receiptMimeType = 'image/png';
  let receiptUrl = null;

  if (file) {
    if (file.buffer) {
      receiptData = file.buffer;
      receiptMimeType = file.mimetype;
    } else if (file.path) {
      receiptUrl = file.path;
    }
  }

  const paymentProof = await PaymentProof.create({
    registrationId,
    eventId: event._id,
    userId: req.userId,
    amountInPaise: event.feeAmountInPaise,
    utrNumber,
    payerUpiId,
    receiptData,
    receiptMimeType,
    receiptUrl,
    verificationStatus: 'PENDING',
  });

  await Registration.findByIdAndUpdate(registrationId, {
    paymentStatus: 'PAYMENT_SUBMITTED',
  });

  res.status(201).json({
    success: true,
    message: 'Payment proof submitted successfully! Verification pending by ACES coordinators.',
    paymentProof: {
      id: paymentProof._id,
      utrNumber: paymentProof.utrNumber,
      verificationStatus: paymentProof.verificationStatus,
      amountInPaise: paymentProof.amountInPaise,
    },
  });
};

export const getPaymentScreenshot = async (req, res, next) => {
  const { id } = req.params;
  const payment = await PaymentProof.findById(id);
  if (!payment) {
    return next(new AppError('Payment proof not found', 404));
  }

  // IDOR Protection: only owner, Superadmin, or President can view payment screenshot
  const isOwner = payment.userId.toString() === req.userId;
  const isAdmin = ['SUPER_ADMIN', 'ADMIN', 'PRESIDENT'].includes(req.user.role);
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
  const { status = 'PENDING' } = req.query;
  const filter = {};
  if (status && status !== 'ALL') {
    filter.verificationStatus = status;
  }

  const payments = await PaymentProof.find(filter)
    .populate('userId', 'name email prn department phone')
    .populate('eventId', 'title slug feeAmountInPaise')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: payments.length,
    payments,
  });
};

export const reviewPaymentProof = async (req, res, next) => {
  const { id } = req.params;
  const { status, rejectionReason } = req.validatedBody || req.body;

  const payment = await PaymentProof.findById(id);
  if (!payment) {
    return next(new AppError('Payment record not found', 404));
  }

  payment.verificationStatus = status;
  payment.verifiedBy = req.userId;
  payment.verifiedAt = new Date();
  if (status === 'REJECTED') {
    payment.rejectionReason = rejectionReason || 'Payment proof was unclear or mismatched.';
  }
  await payment.save();

  // If verified, promote registration to REGISTERED and increment event registrationCount
  if (status === 'VERIFIED') {
    await Registration.findByIdAndUpdate(payment.registrationId, {
      status: 'REGISTERED',
      paymentStatus: 'PAYMENT_VERIFIED',
    });
    await Event.findByIdAndUpdate(payment.eventId, {
      $inc: { registrationCount: 1 },
    });
  } else if (status === 'REJECTED') {
    await Registration.findByIdAndUpdate(payment.registrationId, {
      paymentStatus: 'PAYMENT_FAILED',
    });
  }

  res.status(200).json({
    success: true,
    message: `Payment proof marked as ${status}`,
    payment,
  });
};
