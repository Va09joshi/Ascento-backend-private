import * as sectionService from './sections.service.js';

export const createSection = async (req, res, next) => {
  try {
    const section = await sectionService.createSection(req.body);
    res.status(201).json({ success: true, data: section, message: 'Section created successfully' });
  } catch (error) {
    next(error);
  }
};

export const getAllSections = async (req, res, next) => {
  try {
    const { class_id } = req.query;
    const sections = await sectionService.getAllSections(class_id);
    res.status(200).json({ success: true, data: sections });
  } catch (error) {
    next(error);
  }
};

export const getSectionById = async (req, res, next) => {
  try {
    const section = await sectionService.getSectionById(req.params.id);
    res.status(200).json({ success: true, data: section });
  } catch (error) {
    next(error);
  }
};

export const updateSection = async (req, res, next) => {
  try {
    const section = await sectionService.updateSection(req.params.id, req.body);
    res.status(200).json({ success: true, data: section, message: 'Section updated successfully' });
  } catch (error) {
    next(error);
  }
};

export const deleteSection = async (req, res, next) => {
  try {
    await sectionService.deleteSection(req.params.id);
    res.status(200).json({ success: true, message: 'Section deleted (deactivated) successfully' });
  } catch (error) {
    next(error);
  }
};

export const getSectionStudents = async (req, res, next) => {
  try {
    const students = await sectionService.getSectionStudents(req.params.id);
    res.status(200).json({ success: true, data: students });
  } catch (error) {
    next(error);
  }
};

export const assignTeacher = async (req, res, next) => {
  try {
    const { teacher_id } = req.body;
    const section = await sectionService.assignTeacher(req.params.id, teacher_id);
    res.status(200).json({ success: true, data: section, message: 'Teacher assigned successfully' });
  } catch (error) {
    next(error);
  }
};
