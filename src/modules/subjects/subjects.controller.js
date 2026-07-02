import * as subjectService from './subjects.service.js';

export const createSubject = async (req, res, next) => {
  try {
    const subject = await subjectService.createSubject(req.body);
    res.status(201).json({ success: true, data: subject, message: 'Subject created successfully' });
  } catch (error) {
    next(error);
  }
};

export const getAllSubjects = async (req, res, next) => {
  try {
    const subjects = await subjectService.getAllSubjects();
    res.status(200).json({ success: true, data: subjects });
  } catch (error) {
    next(error);
  }
};

export const getSubjectById = async (req, res, next) => {
  try {
    const subject = await subjectService.getSubjectById(req.params.id);
    res.status(200).json({ success: true, data: subject });
  } catch (error) {
    next(error);
  }
};

export const updateSubject = async (req, res, next) => {
  try {
    const subject = await subjectService.updateSubject(req.params.id, req.body);
    res.status(200).json({ success: true, data: subject, message: 'Subject updated successfully' });
  } catch (error) {
    next(error);
  }
};

export const deleteSubject = async (req, res, next) => {
  try {
    await subjectService.deleteSubject(req.params.id);
    res.status(200).json({ success: true, message: 'Subject deleted (deactivated) successfully' });
  } catch (error) {
    next(error);
  }
};

export const assignToClass = async (req, res, next) => {
  try {
    const mapping = await subjectService.assignToClass(req.body);
    res.status(200).json({ success: true, data: mapping, message: 'Subject assigned to class successfully' });
  } catch (error) {
    next(error);
  }
};

export const getSubjectsByClass = async (req, res, next) => {
  try {
    const subjects = await subjectService.getSubjectsByClass(req.params.class_id);
    res.status(200).json({ success: true, data: subjects });
  } catch (error) {
    next(error);
  }
};
