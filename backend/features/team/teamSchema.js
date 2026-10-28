import Joi from 'joi';

export const teamMemberSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required(),
  designation: Joi.string().trim().required(),
  category: Joi.string()
    .valid('FACULTY', 'LEADERSHIP', 'TECHNICAL', 'CREATIVE', 'OPERATIONS', 'DOCUMENTATION', 'COMMITTEE')
    .default('COMMITTEE'),
  photoUrl: Joi.string().allow('', null),
  email: Joi.string().email().allow('', null),
  linkedin: Joi.string().uri().allow('', null),
  github: Joi.string().uri().allow('', null),
  bio: Joi.string().allow('', null),
  displayOrder: Joi.number().integer().default(100),
  isCurrent: Joi.boolean().default(true),
  academicYear: Joi.string().default('2026-27'),
});

export const updateTeamMemberSchema = teamMemberSchema.fork(['name', 'designation'], (s) => s.optional());

export const designationSchema = Joi.object({
  title: Joi.string().trim().min(2).max(100).required(),
  category: Joi.string()
    .valid('FACULTY', 'LEADERSHIP', 'TECHNICAL', 'CREATIVE', 'OPERATIONS', 'DOCUMENTATION', 'COMMITTEE')
    .default('COMMITTEE'),
  displayOrder: Joi.number().integer().default(100),
  isActive: Joi.boolean().default(true),
});
