import * as userService from '../users/users.service.js';

export const createTeacher = async (req, res, next) => {
  try {
    const data = { ...req.body, role: 'teacher' };
    const { user, tempPassword } = await userService.createUser(data, req.user?.email);
    res.status(201).json({
      success: true,
      data: user,
      message: 'Teacher created successfully',
      tempPassword
    });
  } catch (error) {
    next(error);
  }
};

export const listTeachers = async (req, res, next) => {
  try {
    const filters = { ...req.query, role: 'teacher' };
    const teachers = await userService.listUsers(filters);
    res.status(200).json({ success: true, data: teachers });
  } catch (error) {
    next(error);
  }
};

export const getTeacherById = async (req, res, next) => {
  try {
    const teacher = await userService.getUserById(req.params.id);
    if (!teacher || teacher.role !== 'teacher') {
      return res.status(404).json({ success: false, message: 'Teacher not found' });
    }
    res.status(200).json({ success: true, data: teacher });
  } catch (error) {
    next(error);
  }
};

export const updateTeacher = async (req, res, next) => {
  try {
    // Ensure we are updating a teacher
    const existing = await userService.getUserById(req.params.id);
    if (!existing || existing.role !== 'teacher') {
      return res.status(404).json({ success: false, message: 'Teacher not found' });
    }
    const updatedTeacher = await userService.updateUser(req.params.id, req.body, req.file);
    res.status(200).json({ success: true, data: updatedTeacher, message: 'Teacher updated successfully' });
  } catch (error) {
    next(error);
  }
};

export const deactivateTeacher = async (req, res, next) => {
  try {
    const existing = await userService.getUserById(req.params.id);
    if (!existing || existing.role !== 'teacher') {
      return res.status(404).json({ success: false, message: 'Teacher not found' });
    }
    await userService.deactivateUser(req.params.id);
    res.status(200).json({ success: true, message: 'Teacher deactivated successfully' });
  } catch (error) {
    next(error);
  }
};

export const getDashboardStats = async (req, res, next) => {
  try {
    // Stub implementation for teacher dashboard metrics
    res.status(200).json({
      success: true,
      data: {
        total_students: 120,
        pending_homework: 5,
        upcoming_meetings: 2,
        unread_notices: 3,
        recent_activities: []
      },
      message: 'Dashboard stats retrieved successfully'
    });
  } catch (error) {
    next(error);
  }
};
