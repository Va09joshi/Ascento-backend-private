import { Router } from 'express';
import * as attendanceController from './attendance.controller.js';
import { validate } from '../../middleware/validate.js';
import { verifyToken, requireRole } from '../../middleware/auth.middleware.js';
import { auditMiddleware } from '../../middleware/auditLog.js';
import * as schema from './attendance.schema.js';

const router = Router();
router.use(verifyToken);

router.post('/bulk', requireRole('super_admin', 'admin', 'teacher'), validate(schema.markAttendanceSchema), auditMiddleware('MARK_ATTENDANCE', 'attendance'), attendanceController.markBulkAttendance);
router.get('/sheet', requireRole('super_admin', 'admin', 'teacher'), attendanceController.getAttendanceSheet);
router.get('/student/:id', attendanceController.getStudentSummary);
router.get('/report', attendanceController.getAttendanceReport);

export default router;
