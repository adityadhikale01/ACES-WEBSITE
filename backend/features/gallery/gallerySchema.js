import Joi from 'joi';

export const createAlbumSchema = Joi.object({
  title: Joi.string().trim().min(2).max(150).required(),
  slug: Joi.string().trim().lowercase(),
  description: Joi.string().trim().allow('', null),
  eventId: Joi.string().allow('', null),
  eventDate: Joi.date().iso().default(Date.now),
  coverMediaUrl: Joi.string().allow('', null),
  isPublished: Joi.boolean().default(true),
});

export const addMediaSchema = Joi.object({
  albumId: Joi.string().required(),
  mediaType: Joi.string().valid('IMAGE', 'VIDEO').default('IMAGE'),
  url: Joi.string().required(),
  caption: Joi.string().trim().allow('', null),
  displayOrder: Joi.number().integer().default(100),
});
