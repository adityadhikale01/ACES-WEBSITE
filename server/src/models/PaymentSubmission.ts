import mongoose, { Schema, Document } from 'mongoose';

export type PaymentStatus =
  | 'AWAITING_PAYMENT'
  | 'PROOF_SUBMITTED'
  | 'UNDER_REVIEW'
  | 'VERIFIED'
  | 'REJECTED'
  | 'RESUBMISSION_REQUESTED'
  | 'CANCELLED';

export interface IPaymentAudit {
  action: string;
  performedBy: string;
  timestamp: Date;
  notes?: string;
}

export interface IPaymentSubmission extends Document {
  registrationId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  eventId: mongoose.Types.ObjectId;
  expectedAmount: number; // in integer paise (e.g. 15000 = Rs. 150)
  currency: string;
  utrReference: string; // transaction ref or UTR
  screenshotKey: string; // private storage key / path
  screenshotMimeType: string;
  submissionTimestamp: Date;
  status: PaymentStatus;
  adminDecisionBy?: string;
  adminNotes?: string;
  rejectionReason?: string;
  verifiedAt?: Date;
  auditHistory: IPaymentAudit[];
  createdAt: Date;
  updatedAt: Date;
}

const PaymentAuditSchema = new Schema<IPaymentAudit>(
  {
    action: { type: String, required: true },
    performedBy: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    notes: { type: String },
  },
  { _id: false }
);

const PaymentSubmissionSchema = new Schema<IPaymentSubmission>(
  {
    registrationId: {
      type: Schema.Types.ObjectId,
      ref: 'EventRegistration',
      required: true,
      index: true,
    },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    eventId: { type: Schema.Types.ObjectId, ref: 'Event', required: true, index: true },
    expectedAmount: { type: Number, required: true }, // integer paise
    currency: { type: String, default: 'INR' },
    utrReference: { type: String, required: true, trim: true, index: true },
    screenshotKey: { type: String, required: true },
    screenshotMimeType: { type: String, default: 'image/jpeg' },
    submissionTimestamp: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: [
        'AWAITING_PAYMENT',
        'PROOF_SUBMITTED',
        'UNDER_REVIEW',
        'VERIFIED',
        'REJECTED',
        'RESUBMISSION_REQUESTED',
        'CANCELLED',
      ],
      default: 'PROOF_SUBMITTED',
      index: true,
    },
    adminDecisionBy: { type: String },
    adminNotes: { type: String },
    rejectionReason: { type: String },
    verifiedAt: { type: Date },
    auditHistory: [PaymentAuditSchema],
  },
  {
    timestamps: true,
  }
);

export const PaymentSubmission = mongoose.model<IPaymentSubmission>(
  'PaymentSubmission',
  PaymentSubmissionSchema
);
