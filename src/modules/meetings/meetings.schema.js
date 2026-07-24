import Joi from 'joi';

export const createMeetingSchema = Joi.object({
  title: Joi.string().required(),
  meet_link: Joi.string().uri().required(),
  meet_date: Joi.date().iso().required(),
  start_time: Joi.string().pattern(/^([01]\d|2[0-3]):?([0-5]\d)$/).required(),
  end_time: Joi.string().pattern(/^([01]\d|2[0-3]):?([0-5]\d)$/).required(),
  class_id: Joi.string().uuid().allow('', null),
  section_id: Joi.string().uuid().allow('', null)
});
