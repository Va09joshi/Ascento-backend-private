import { Router } from 'express';
import * as teacherController from './teachers.controller.js';
import { validate } from '../../middleware/validate.js';
import { verifyToken, requireRole } from '../../middleware/auth.middleware.js';
import { auditMiddleware } from '../../middleware/auditLog.js';
import { uploadMemory } from '../../middleware/upload.js';
import * as schema from './teachers.schema.js';

const router = Router();

router.use(verifyToken);

// Middleware to parse form-data strings to boolean for teachers
const parseTeacherForm = (req, res, next) => {
  if (req.body) {
    if (req.body.is_active !== undefined) {
      req.body.is_active = req.body.is_active === 'true' || req.body.is_active === true;
    }
  }
  next();
};

router.post(
  '/',
  requireRole('super_admin', 'admin'),
  uploadMemory.single('avatar'),
  parseTeacherForm,
  validate(schema.createTeacherSchema),
  auditMiddleware('CREATE_TEACHER', 'users'),
  teacherController.createTeacher
);

router.get('/', requireRole('super_admin', 'admin'), teacherController.listTeachers);
router.get('/dashboard', requireRole('super_admin', 'admin', 'teacher'), teacherController.getDashboardStats);
router.get('/my-students', requireRole('teacher'), teacherController.getMyStudentsBySection);
router.get('/:id', requireRole('super_admin', 'admin', 'teacher'), teacherController.getTeacherById);

router.patch(
  '/:id',
  requireRole('super_admin', 'admin'),
  uploadMemory.single('avatar'),
  parseTeacherForm,
  validate(schema.updateTeacherSchema),
  auditMiddleware('UPDATE_TEACHER', 'users'),
  teacherController.updateTeacher
);

router.delete(
  '/:id',
  requireRole('super_admin', 'admin'),
  auditMiddleware('DEACTIVATE_TEACHER', 'users'),
  teacherController.deactivateTeacher
);

export default router;
