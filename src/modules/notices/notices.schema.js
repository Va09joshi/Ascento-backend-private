import Joi from 'joi';

export const createNoticeSchema = Joi.object({
  title: Joi.string().required(),
  content: Joi.string().required(),
  banner_url: Joi.string().uri().allow('', null).optional(),
  type: Joi.string().valid('event', 'news', 'update', 'alert').optional(),
  is_published: Joi.boolean().optional()
});

export const updateNoticeSchema = Joi.object({
  title: Joi.string().optional(),
  content: Joi.string().optional(),
  banner_url: Joi.string().uri().allow('', null).optional(),
  type: Joi.string().valid('event', 'news', 'update', 'alert').optional(),
  is_published: Joi.boolean().optional()
});
