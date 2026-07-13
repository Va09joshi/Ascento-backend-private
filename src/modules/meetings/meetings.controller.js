import * as MeetingsService from './meetings.service.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { sendResponse } from '../../utils/responseHandler.js';

export const getMeetings = asyncHandler(async (req, res) => {
  const { class_id, section_id } = req.query;
  const filters = { class_id, section_id };
  
  const meetings = await MeetingsService.getMeetings(filters);
  return sendResponse(res, 200, 'Meetings fetched successfully', meetings);
});

export const createMeeting = asyncHandler(async (req, res) => {
  const data = { ...req.body, created_by: req.user.id };
  const meeting = await MeetingsService.createMeeting(data);
  return sendResponse(res, 201, 'Meeting created successfully', meeting);
});

export const deleteMeeting = asyncHandler(async (req, res) => {
  const { id } = req.params;
  await MeetingsService.deleteMeeting(id, req.user.id);
  return sendResponse(res, 200, 'Meeting deleted successfully');
});
