import * as classService from './classes.service.js';

export const createClass = async (req, res, next) => {
  try {
    const classData = await classService.createClass(req.body);
    res.status(201).json({ success: true, data: classData, message: 'Class created successfully' });
  } catch (error) {
    next(error);
  }
};

export const getAllClasses = async (req, res, next) => {
  try {
    const { branch_id, academic_year_id } = req.query;
    const classes = await classService.getAllClasses(branch_id, academic_year_id);
    res.status(200).json({ success: true, data: classes });
  } catch (error) {
    next(error);
  }
};

export const getClassById = async (req, res, next) => {
  try {
    const classData = await classService.getClassById(req.params.id);
    res.status(200).json({ success: true, data: classData });
  } catch (error) {
    next(error);
  }
};

export const updateClass = async (req, res, next) => {
  try {
    const classData = await classService.updateClass(req.params.id, req.body);
    res.status(200).json({ success: true, data: classData, message: 'Class updated successfully' });
  } catch (error) {
    next(error);
  }
};

export const deleteClass = async (req, res, next) => {
  try {
    await classService.deleteClass(req.params.id);
    res.status(200).json({ success: true, message: 'Class deleted (deactivated) successfully' });
  } catch (error) {
    next(error);
  }
};

export const getClassSections = async (req, res, next) => {
  try {
    const sections = await classService.getClassSections(req.params.id);
    res.status(200).json({ success: true, data: sections });
  } catch (error) {
    next(error);
  }
};

export const getClassStudents = async (req, res, next) => {
  try {
    const students = await classService.getClassStudents(req.params.id);
    res.status(200).json({ success: true, data: students });
  } catch (error) {
    next(error);
  }
};
