import * as academicService from './academic.service.js';

export const createAcademicYear = async (req, res, next) => {
  try {
    const year = await academicService.createAcademicYear(req.body);
    res.status(201).json({ success: true, data: year, message: 'Academic year created successfully' });
  } catch (error) {
    next(error);
  }
};

export const getAllAcademicYears = async (req, res, next) => {
  try {
    const years = await academicService.getAllAcademicYears();
    res.status(200).json({ success: true, data: years });
  } catch (error) {
    next(error);
  }
};

export const getCurrentAcademicYear = async (req, res, next) => {
  try {
    const year = await academicService.getCurrentAcademicYear();
    if (!year) {
      return res.status(404).json({ success: false, error: { message: 'No current academic year found' } });
    }
    res.status(200).json({ success: true, data: year });
  } catch (error) {
    next(error);
  }
};

export const updateAcademicYear = async (req, res, next) => {
  try {
    const year = await academicService.updateAcademicYear(req.params.id, req.body);
    res.status(200).json({ success: true, data: year, message: 'Academic year updated successfully' });
  } catch (error) {
    next(error);
  }
};

export const setCurrentAcademicYear = async (req, res, next) => {
  try {
    const year = await academicService.setCurrentAcademicYear(req.params.id);
    res.status(200).json({ success: true, data: year, message: 'Academic year set as current' });
  } catch (error) {
    next(error);
  }
};

export const deleteAcademicYear = async (req, res, next) => {
  try {
    await academicService.deleteAcademicYear(req.params.id);
    res.status(200).json({ success: true, message: 'Academic year deleted successfully' });
  } catch (error) {
    next(error);
  }
};
