import Joi from 'joi';

export const createTeacherSchema = Joi.object({
  full_name: Joi.string().required(),
  email: Joi.string().email().required(),
  phone: Joi.string().allow('', null),
  gender: Joi.string().valid('male', 'female', 'other').allow('', null),
  branch_id: Joi.string().uuid().allow('', null),
  domain_id: Joi.string().uuid().allow('', null),
  address: Joi.string().allow('', null),
});

export const updateTeacherSchema = Joi.object({
  full_name: Joi.string(),
  email: Joi.string().email(),
  phone: Joi.string().allow('', null),
  gender: Joi.string().valid('male', 'female', 'other').allow('', null),
  branch_id: Joi.string().uuid().allow('', null),
  domain_id: Joi.string().uuid().allow('', null),
  address: Joi.string().allow('', null),
  is_active: Joi.boolean(),
}).min(1);
