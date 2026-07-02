import { Router } from 'express';
import * as sectionController from './sections.controller.js';
import { validate } from '../../middleware/validate.js';
import { verifyToken, requireRole } from '../../middleware/auth.middleware.js';
import { auditMiddleware } from '../../middleware/auditLog.js';
import * as schema from './sections.schema.js';

const router = Router();

router.use(verifyToken);

router.post(
  '/',
  requireRole('super_admin', 'admin'),
  validate(schema.sectionSchema),
  auditMiddleware('CREATE_SECTION', 'sections'),
  sectionController.createSection
);

router.get('/', sectionController.getAllSections);
router.get('/:id', sectionController.getSectionById);
router.get('/:id/students', sectionController.getSectionStudents);

router.patch(
  '/:id',
  requireRole('super_admin', 'admin'),
  validate(schema.sectionSchema),
  auditMiddleware('UPDATE_SECTION', 'sections'),
  sectionController.updateSection
);

router.delete(
  '/:id',
  requireRole('super_admin', 'admin'),
  auditMiddleware('DELETE_SECTION', 'sections'),
  sectionController.deleteSection
);

router.post(
  '/:id/assign-teacher',
  requireRole('super_admin', 'admin'),
  validate(schema.assignTeacherSchema),
  auditMiddleware('ASSIGN_TEACHER', 'sections'),
  sectionController.assignTeacher
);

export default router;
