import * as aiService from './ai.service.js';

export const generateStudentReport = async (req, res, next) => {
  try {
    const report = await aiService.generateStudentReport(req.body.student_id, req.body.academic_year_id);
    res.status(200).json({ success: true, data: { report } });
  } catch (error) { next(error); }
};
