import Joi from 'joi';

export const activitySchema = Joi.object({
  title: Joi.string().trim().min(3).max(200).required(),
  slug: Joi.string().trim().lowercase(),
  type: Joi.string().valid('ACTIVITY', 'ACHIEVEMENT').default('ACTIVITY'),
  category: Joi.string().default('OTHER'),
  date: Joi.date().iso().default(Date.now),
  description: Joi.string().trim().min(5).required(),
  impactSummary: Joi.string().trim().allow('', null),
  studentNames: Joi.array().items(Joi.string().trim()).default([]),
  guideName: Joi.string().trim().allow('', null),
  imageUrl: Joi.string().allow('', null),
  documentUrl: Joi.string().allow('', null),
  isFeatured: Joi.boolean().default(false),
  academicYear: Joi.string().default('2026-27'),
});
