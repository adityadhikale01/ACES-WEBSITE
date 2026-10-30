import Joi from 'joi';

export const registerSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100),
  fullName: Joi.string().trim().min(2).max(100),
  email: Joi.string().trim().email().required(),
  password: Joi.string().min(6).max(100).required(),
  department: Joi.string().trim().default('Computer Engineering'),
  academicYear: Joi.string().trim().allow('', null),
  prn: Joi.string().trim().allow('', null),
  phone: Joi.string().trim().allow('', null),
}).or('name', 'fullName');

export const loginSchema = Joi.object({
  email: Joi.string().trim().email().required(),
  password: Joi.string().required(),
});
