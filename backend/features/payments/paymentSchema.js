import Joi from 'joi';

export const submitProofSchema = Joi.object({
  registrationId: Joi.string().required(),
  utrNumber: Joi.string().trim().min(6).max(40).required(),
  payerUpiId: Joi.string().trim().allow('', null),
});

export const verifyPaymentSchema = Joi.object({
  status: Joi.string().valid('VERIFIED', 'REJECTED').required(),
  rejectionReason: Joi.string().trim().allow('', null),
});
