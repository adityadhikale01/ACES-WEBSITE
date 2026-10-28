import Joi from 'joi';

export const applyMembershipSchema = Joi.object({
  fullName: Joi.string().trim().min(2).max(100).required(),
  email: Joi.string().trim().email().required(),
  phone: Joi.string().trim().min(8).max(20).required(),
  department: Joi.string().trim().default('Computer Engineering'),
  academicYear: Joi.string().trim().required(),
  division: Joi.string().trim().allow('', null),
  prn: Joi.string().trim().allow('', null),
  rollNumber: Joi.string().trim().allow('', null),
  interestedDomains: Joi.array().items(Joi.string()).default([]),
  whyJoin: Joi.string().trim().min(10).required(),
  technicalSkills: Joi.string().trim().allow('', null),
  pastExperience: Joi.string().trim().allow('', null),
});

export const reviewMembershipSchema = Joi.object({
  status: Joi.string().valid('ACCEPTED', 'REJECTED').required(),
  reviewerNotes: Joi.string().trim().allow('', null),
});
