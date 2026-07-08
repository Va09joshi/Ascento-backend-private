import * as attendanceService from './attendance.service.js';

export const markBulkAttendance = async (req, res, next) => {
  try {
    const records = await attendanceService.markBulkAttendance(req.body, req.user.id);
    res.status(201).json({ success: true, data: records, message: 'Attendance marked' });
  } catch (error) { next(error); }
};

export const getAttendanceSheet = async (req, res, next) => {
  try {
    const { section_id, subject_id, date } = req.query;
    if (!section_id || !subject_id || !date) {
      return res.status(400).json({ success: false, error: { message: 'Missing parameters' } });
    }
    const sheet = await attendanceService.getAttendanceSheet(section_id, subject_id, date);
    res.status(200).json({ success: true, data: sheet });
  } catch (error) { next(error); }
};

export const getStudentSummary = async (req, res, next) => {
  try {
    const student_id = ['super_admin', 'admin', 'teacher'].includes(req.user.role) && req.params.id !== 'my' ? req.params.id : req.user.id;
    const summary = await attendanceService.getStudentSummary(student_id);
    res.status(200).json({ success: true, data: summary });
  } catch (error) { next(error); }
};

export const getAttendanceReport = async (req, res, next) => {
  // Stub endpoint to resolve 404s for dashboard
  res.status(200).json({ success: true, data: [] });
};
