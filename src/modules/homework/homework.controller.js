import * as HomeworkService from './homework.service.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { sendResponse } from '../../utils/responseHandler.js';
import { AppError } from '../../middleware/errorHandler.js';

export const getHomeworks = asyncHandler(async (req, res) => {
  const { class_id, section_id, subject_id, teacher_id } = req.query;
  const filters = { class_id, section_id, subject_id, teacher_id };
  
  const homeworks = await HomeworkService.getHomeworks(filters);
  return sendResponse(res, 200, 'Homework fetched successfully', homeworks);
});

export const createHomework = asyncHandler(async (req, res) => {
  const data = { ...req.body, teacher_id: req.user.id };
  const homework = await HomeworkService.createHomework(data);
  return sendResponse(res, 201, 'Homework created successfully', homework);
});

export const getSubmissions = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const submissions = await HomeworkService.getHomeworkSubmissions(id);
  return sendResponse(res, 200, 'Submissions fetched successfully', submissions);
});

export const submitHomework = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { file_url } = req.body;
  const student_id = req.user.id;
  
  const submission = await HomeworkService.submitHomework(id, student_id, file_url);
  return sendResponse(res, 200, 'Homework submitted successfully', submission);
});

export const gradeHomework = asyncHandler(async (req, res) => {
  const { submission_id } = req.params;
  const { grade, remarks } = req.body;
  
  const graded = await HomeworkService.gradeHomework(submission_id, grade, remarks);
  return sendResponse(res, 200, 'Homework graded successfully', graded);
});
