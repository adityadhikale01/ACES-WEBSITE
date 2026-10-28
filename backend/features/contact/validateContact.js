import { contactSchema } from './contactSchema.js';

export const validateContact = (req, res, next) => {
  const { error, value } = contactSchema.validate(req.body, { abortEarly: false, stripUnknown: true });
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
