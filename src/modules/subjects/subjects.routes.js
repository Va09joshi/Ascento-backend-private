import { Router } from 'express';
import * as subjectController from './subjects.controller.js';
import { validate } from '../../middleware/validate.js';
import { verifyToken, requireRole } from '../../middleware/auth.middleware.js';
import { auditMiddleware } from '../../middleware/auditLog.js';
import * as schema from './subjects.schema.js';

const router = Router();

router.use(verifyToken);

router.post(
  '/',
  requireRole('super_admin', 'admin'),
  validate(schema.subjectSchema),
  auditMiddleware('CREATE_SUBJECT', 'subjects'),
  subjectController.createSubject
);

router.get('/', subjectController.getAllSubjects);
router.get('/:id', subjectController.getSubjectById);
router.get('/class/:class_id', subjectController.getSubjectsByClass);

router.patch(
  '/:id',
  requireRole('super_admin', 'admin'),
  validate(schema.subjectSchema),
  auditMiddleware('UPDATE_SUBJECT', 'subjects'),
  subjectController.updateSubject
);

router.delete(
  '/:id',
  requireRole('super_admin', 'admin'),
  auditMiddleware('DELETE_SUBJECT', 'subjects'),
  subjectController.deleteSubject
);

router.post(
  '/assign-to-class',
  requireRole('super_admin', 'admin'),
  validate(schema.assignToClassSchema),
  auditMiddleware('ASSIGN_SUBJECT_TO_CLASS', 'class_subjects'),
  subjectController.assignToClass
);

export default router;
