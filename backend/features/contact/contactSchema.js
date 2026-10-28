import Joi from 'joi';

export const contactSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required(),
  email: Joi.string().trim().email().required(),
  subject: Joi.string().trim().min(3).max(200).required(),
  message: Joi.string().trim().min(5).required(),
});
