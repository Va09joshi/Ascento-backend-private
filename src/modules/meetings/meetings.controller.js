import * as MeetingsService from './meetings.service.js';

export const getMeetings = async (req, res, next) => {
  try {
    const { class_id, section_id } = req.query;
    const filters = { class_id, section_id };
    
    const meetings = await MeetingsService.getMeetings(filters);
    res.status(200).json({ success: true, message: 'Meetings fetched successfully', data: meetings });
  } catch (error) { next(error); }
};

export const createMeeting = async (req, res, next) => {
  try {
    const data = { ...req.body, created_by: req.user.id };
    const meeting = await MeetingsService.createMeeting(data);
    res.status(201).json({ success: true, message: 'Meeting created successfully', data: meeting });
  } catch (error) { next(error); }
};

export const deleteMeeting = async (req, res, next) => {
  try {
    const { id } = req.params;
    await MeetingsService.deleteMeeting(id, req.user.id);
    res.status(200).json({ success: true, message: 'Meeting deleted successfully' });
  } catch (error) { next(error); }
};
