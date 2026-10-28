import mongoose from 'mongoose';

const paymentProofSchema = new mongoose.Schema(
  {
    registrationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Registration',
      required: true,
      index: true,
    },
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    amountInPaise: {
      type: Number,
      required: true,
    },
    utrNumber: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },
    payerUpiId: {
      type: String,
      trim: true,
    },
    receiptData: {
      type: Buffer,
    },
    receiptMimeType: {
      type: String,
      default: 'image/png',
    },
    receiptUrl: {
      type: String,
    },
    verificationStatus: {
      type: String,
      enum: ['PENDING', 'VERIFIED', 'REJECTED'],
      default: 'PENDING',
      index: true,
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    verifiedAt: {
      type: Date,
    },
    rejectionReason: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

export const PaymentProof = mongoose.model('PaymentProof', paymentProofSchema);
export default PaymentProof;
