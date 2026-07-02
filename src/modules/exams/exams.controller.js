import * as examService from './exams.service.js';

export const createExam = async (req, res, next) => {
  try {
    const exam = await examService.createExam({ ...req.body, created_by: req.user.id });
    res.status(201).json({ success: true, data: exam });
  } catch (error) { next(error); }
};

export const getExams = async (req, res, next) => {
  try {
    const exams = await examService.getExams(req.query);
    res.status(200).json({ success: true, data: exams });
  } catch (error) { next(error); }
};

export const getExamById = async (req, res, next) => {
  try {
    const exam = await examService.getExamById(req.params.id);
    res.status(200).json({ success: true, data: exam });
  } catch (error) { next(error); }
};

export const updateExam = async (req, res, next) => {
  try {
    const exam = await examService.updateExam(req.params.id, req.body);
    res.status(200).json({ success: true, data: exam });
  } catch (error) { next(error); }
};

export const deleteExam = async (req, res, next) => {
  try {
    await examService.deleteExam(req.params.id);
    res.status(200).json({ success: true, message: 'Exam deleted' });
  } catch (error) { next(error); }
};

export const enterResults = async (req, res, next) => {
  try {
    const results = await examService.enterResults(req.params.id, req.body.results, req.user.id);
    res.status(201).json({ success: true, data: results, message: 'Results saved' });
  } catch (error) { next(error); }
};

export const getExamResults = async (req, res, next) => {
  try {
    const results = await examService.getExamResults(req.params.id);
    res.status(200).json({ success: true, data: results });
  } catch (error) { next(error); }
};

export const getMyResult = async (req, res, next) => {
  try {
    // If student/parent is calling, use their own id
    const student_id = ['super_admin', 'admin'].includes(req.user.role) && req.query.student_id ? req.query.student_id : req.user.id;
    const result = await examService.getMyResult(req.params.id, student_id);
    if (!result) return res.status(404).json({ success: false, error: { message: 'Result not found' } });
    res.status(200).json({ success: true, data: result });
  } catch (error) { next(error); }
};
