import { Router } from 'express';
import * as classController from './classes.controller.js';
import { validate } from '../../middleware/validate.js';
import { verifyToken, requireRole } from '../../middleware/auth.middleware.js';
import { auditMiddleware } from '../../middleware/auditLog.js';
import * as schema from './classes.schema.js';

const router = Router();

router.use(verifyToken);

router.post(
  '/',
  requireRole('super_admin', 'admin'),
  validate(schema.classSchema),
  auditMiddleware('CREATE_CLASS', 'classes'),
  classController.createClass
);

router.get('/', classController.getAllClasses);
router.get('/:id', classController.getClassById);
router.get('/:id/sections', classController.getClassSections);
router.get('/:id/students', classController.getClassStudents);

router.patch(
  '/:id',
  requireRole('super_admin', 'admin'),
  validate(schema.classSchema),
  auditMiddleware('UPDATE_CLASS', 'classes'),
  classController.updateClass
);

router.delete(
  '/:id',
  requireRole('super_admin', 'admin'),
  auditMiddleware('DELETE_CLASS', 'classes'),
  classController.deleteClass
);

export default router;
