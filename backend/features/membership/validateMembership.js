import { applyMembershipSchema, reviewMembershipSchema } from './membershipSchema.js';

export const validateApplyMembership = (req, res, next) => {
  const { error, value } = applyMembershipSchema.validate(req.body, { abortEarly: false, stripUnknown: true });
  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details.map((d) => d.message).join(', '),
      errors: error.details,
    });
  }
  req.validatedBody = value;
  next();
};

export const validateReviewMembership = (req, res, next) => {
  const { error, value } = reviewMembershipSchema.validate(req.body, { abortEarly: false, stripUnknown: true });
  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details.map((d) => d.message).join(', '),
      errors: error.details,
    });
  }
  req.validatedBody = value;
  next();
};
