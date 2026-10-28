import { updateContentSchema } from './contentSchema.js';

export const validateUpdateContent = (req, res, next) => {
  // If req.body is already the data object or wrapped in { data: ... }
  if (!req.body.data && typeof req.body === 'object') {
    req.body = { data: req.body };
  }
  const { error, value } = updateContentSchema.validate(req.body, { abortEarly: false });
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
