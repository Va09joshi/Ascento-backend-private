import { Router } from 'express';
import * as studentsController from './students.controller.js';
import { validate } from '../../middleware/validate.js';
import { verifyToken, requireRole } from '../../middleware/auth.middleware.js';
import { auditMiddleware } from '../../middleware/auditLog.js';
import { uploadMemory } from '../../middleware/upload.js';
import * as schema from './students.schema.js';

const router = Router();

router.use(verifyToken);

// Middleware to parse form-data strings to boolean
const parseStudentForm = (req, res, next) => {
  if (req.body) {
    if (req.body.is_active !== undefined) {
      req.body.is_active = req.body.is_active === 'true' || req.body.is_active === true;
    }
  }
  next();
};

// ==========================================
// STUDENT SELF-SERVICE ROUTES
// ==========================================

// GET /students/my-profile
router.get('/my-profile', requireRole('student'), studentsController.getStudentById);

// PATCH /students/my-profile
router.patch(
  '/my-profile',
  requireRole('student'),
  uploadMemory.single('avatar'),
  parseStudentForm,
  validate(schema.selfUpdateSchema),
  auditMiddleware('SELF_UPDATE_STUDENT', 'users'),
  studentsController.updateStudent
);

// ==========================================
// ADMIN/TEACHER ROUTES
// ==========================================

// GET /students
router.get('/', requireRole('super_admin', 'admin', 'teacher'), studentsController.listStudents);

// POST /students
router.post(
  '/',
  requireRole('super_admin', 'admin'),
  uploadMemory.single('avatar'),
  parseStudentForm,
  validate(schema.createStudentSchema),
  auditMiddleware('CREATE_STUDENT', 'users'),
  studentsController.createStudent
);

// GET /students/:id
router.get('/:id', requireRole('super_admin', 'admin', 'teacher', 'parent'), studentsController.getStudentById);

// PATCH /students/:id
router.patch(
  '/:id',
  requireRole('super_admin', 'admin'),
  uploadMemory.single('avatar'),
  parseStudentForm,
  validate(schema.updateStudentSchema),
  auditMiddleware('UPDATE_STUDENT', 'users'),
  studentsController.updateStudent
);

// DELETE /students/:id
router.delete(
  '/:id',
  requireRole('super_admin', 'admin'),
  auditMiddleware('DEACTIVATE_STUDENT', 'users'),
  studentsController.deactivateStudent
);

export default router;
