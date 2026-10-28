import Joi from 'joi';

export const createEventSchema = Joi.object({
  title: Joi.string().trim().min(3).max(200).required(),
  slug: Joi.string().trim().lowercase(),
  shortDescription: Joi.string().trim().min(5).max(300).required(),
  description: Joi.string().trim().min(10).required(),
  category: Joi.string()
    .valid('WORKSHOP', 'SEMINAR', 'COMPETITION', 'HACKATHON', 'EXPERT_TALK', 'CULTURAL', 'OTHER')
    .default('WORKSHOP'),
  eventDate: Joi.date().iso().required(),
  endDate: Joi.date().iso().allow(null),
  registrationDeadline: Joi.date().iso().allow(null),
  venue: Joi.string().trim().default('Dept. of Computer Engineering, MVPS KBTCOE Nashik'),
  isOnline: Joi.boolean().default(false),
  onlineMeetingUrl: Joi.string().uri().allow('', null),
  posterUrl: Joi.string().allow('', null),
  isPaid: Joi.boolean().default(false),
  feeAmountInPaise: Joi.number().integer().min(0).default(0),
  upiId: Joi.string().trim().allow('', null),
  upiQrCodeUrl: Joi.string().allow('', null),
  maxCapacity: Joi.number().integer().min(1).default(100),
  status: Joi.string()
    .valid('DRAFT', 'PUBLISHED', 'REGISTRATION_CLOSED', 'COMPLETED', 'CANCELLED')
    .default('PUBLISHED'),
  tags: Joi.array().items(Joi.string().trim()).default([]),
  prerequisites: Joi.array().items(Joi.string().trim()).default([]),
  learningOutcomes: Joi.array().items(Joi.string().trim()).default([]),
  facultyCoordinators: Joi.array().items(Joi.object({ name: Joi.string(), designation: Joi.string() })).default([]),
  studentCoordinators: Joi.array().items(Joi.object({ name: Joi.string(), phone: Joi.string(), role: Joi.string() })).default([]),
});

export const updateEventSchema = createEventSchema.fork(
  ['title', 'shortDescription', 'description', 'eventDate'],
  (schema) => schema.optional()
);
