import * as HomeworkService from './homework.service.js';

export const getHomeworks = async (req, res, next) => {
  try {
    const { class_id, section_id, subject_id, teacher_id } = req.query;
    const filters = { class_id, section_id, subject_id, teacher_id };
    const isStaff = ['super_admin', 'admin', 'teacher'].includes(req.user.role);
    const studentId = !isStaff ? req.user.id : null;
    
    const homeworks = await HomeworkService.getHomeworks(filters, studentId);
    res.status(200).json({ success: true, message: 'Homework fetched successfully', data: homeworks });
  } catch (error) { next(error); }
};

export const createHomework = async (req, res, next) => {
  try {
    const data = { ...req.body, teacher_id: req.user.id };
    const homework = await HomeworkService.createHomework(data);
    res.status(201).json({ success: true, message: 'Homework created successfully', data: homework });
  } catch (error) { next(error); }
};

export const getSubmissions = async (req, res, next) => {
  try {
    const { id } = req.params;
    const submissions = await HomeworkService.getHomeworkSubmissions(id);
    res.status(200).json({ success: true, message: 'Submissions fetched successfully', data: submissions });
  } catch (error) { next(error); }
};

export const submitHomework = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { file_url } = req.body;
    const student_id = req.user.id;
    
    const submission = await HomeworkService.submitHomework(id, student_id, file_url);
    res.status(200).json({ success: true, message: 'Homework submitted successfully', data: submission });
  } catch (error) { next(error); }
};

export const gradeHomework = async (req, res, next) => {
  try {
    const { submission_id } = req.params;
    const { grade, remarks } = req.body;
    
    const graded = await HomeworkService.gradeHomework(submission_id, grade, remarks);
    res.status(200).json({ success: true, message: 'Homework graded successfully', data: graded });
  } catch (error) { next(error); }
};
