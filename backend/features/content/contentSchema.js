import Joi from 'joi';

export const updateContentSchema = Joi.object({
  data: Joi.object().required(),
});
