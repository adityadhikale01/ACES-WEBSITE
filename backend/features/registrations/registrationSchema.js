import Joi from 'joi';

export const createRegistrationSchema = Joi.object({
  eventId: Joi.string().required(),
  name: Joi.string().trim().min(2).max(100),
  email: Joi.string().trim().email(),
  department: Joi.string().trim().default('Computer Engineering'),
  academicYear: Joi.string().trim().allow('', null),
  prn: Joi.string().trim().allow('', null),
  phone: Joi.string().trim().allow('', null),
});

export const updateAttendanceSchema = Joi.object({
  attended: Joi.boolean().required(),
});
