import Joi from 'joi';

export const createHomeworkSchema = Joi.object({
  title: Joi.string().required(),
  description: Joi.string().allow('', null),
  file_url: Joi.string().uri().allow('', null),
  due_date: Joi.date().iso().required(),
  class_id: Joi.string().uuid().required(),
  section_id: Joi.string().uuid().required(),
  subject_id: Joi.string().uuid().required()
});

export const updateHomeworkSchema = Joi.object({
  title: Joi.string(),
  description: Joi.string().allow('', null),
  file_url: Joi.string().uri().allow('', null),
  due_date: Joi.date().iso(),
  class_id: Joi.string().uuid(),
  section_id: Joi.string().uuid(),
  subject_id: Joi.string().uuid()
});

export const submitHomeworkSchema = Joi.object({
  file_url: Joi.string().uri().required()
});

export const gradeHomeworkSchema = Joi.object({
  grade: Joi.number().integer().min(0).max(100).required(),
  remarks: Joi.string().allow('', null)
});
