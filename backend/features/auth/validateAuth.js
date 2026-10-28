import { registerSchema, loginSchema } from './authSchema.js';

export const validateRegister = (req, res, next) => {
  const { error, value } = registerSchema.validate(req.body, { abortEarly: false, stripUnknown: true });
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

export const validateLogin = (req, res, next) => {
  const { error, value } = loginSchema.validate(req.body, { abortEarly: false, stripUnknown: true });
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
