import { Router } from 'express';
import * as timetableController from './timetable.controller.js';
import { validate } from '../../middleware/validate.js';
import { verifyToken, requireRole } from '../../middleware/auth.middleware.js';
import { auditMiddleware } from '../../middleware/auditLog.js';
import * as schema from './timetable.schema.js';

const router = Router();

router.use(verifyToken);

router.post(
  '/',
  requireRole('super_admin', 'admin'),
  validate(schema.createPeriodSchema),
  auditMiddleware('CREATE_TIMETABLE_PERIOD', 'timetable_periods'),
  timetableController.createPeriod
);

router.get('/', timetableController.getSectionTimetable);
router.get('/section/:section_id', timetableController.getSectionTimetable);

router.put(
  '/:id',
  requireRole('super_admin', 'admin'),
  validate(schema.updatePeriodSchema),
  auditMiddleware('UPDATE_TIMETABLE_PERIOD', 'timetable_periods'),
  timetableController.updatePeriod
);

router.delete(
  '/:id',
  requireRole('super_admin', 'admin'),
  auditMiddleware('DELETE_TIMETABLE_PERIOD', 'timetable_periods'),
  timetableController.deletePeriod
);

export default router;
