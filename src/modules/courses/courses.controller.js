import * as courseService from './courses.service.js';

export const createCourse = async (req, res, next) => {
  try {
    const course = await courseService.createCourse(req.body);
    res.status(201).json({ success: true, data: course });
  } catch (error) { next(error); }
};

export const getAllCourses = async (req, res, next) => {
  try {
    const courses = await courseService.getAllCourses(req.query.branch_id);
    res.status(200).json({ success: true, data: courses });
  } catch (error) { next(error); }
};

export const getCourseById = async (req, res, next) => {
  try {
    const course = await courseService.getCourseById(req.params.id);
    res.status(200).json({ success: true, data: course });
  } catch (error) { next(error); }
};

export const updateCourse = async (req, res, next) => {
  try {
    const course = await courseService.updateCourse(req.params.id, req.body);
    res.status(200).json({ success: true, data: course });
  } catch (error) { next(error); }
};

export const deleteCourse = async (req, res, next) => {
  try {
    await courseService.deleteCourse(req.params.id);
    res.status(200).json({ success: true, message: 'Course archived' });
  } catch (error) { next(error); }
};

export const enrollStudent = async (req, res, next) => {
  try {
    // If student/parent is calling, use their own id. If admin, use body
    const student_id = ['super_admin', 'admin'].includes(req.user.role) ? req.body.student_id : (req.body.student_id || req.user.id);
    const enrollment = await courseService.enrollStudent({ student_id, course_id: req.params.id, section_id: req.body.section_id });
    res.status(201).json({ success: true, data: enrollment });
  } catch (error) { next(error); }
};

export const getCourseStudents = async (req, res, next) => {
  try {
    const students = await courseService.getCourseStudents(req.params.id);
    res.status(200).json({ success: true, data: students });
  } catch (error) { next(error); }
};
