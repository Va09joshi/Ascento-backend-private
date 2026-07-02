import { Router } from 'express';
import * as courseController from './courses.controller.js';
import { validate } from '../../middleware/validate.js';
import { verifyToken, requireRole } from '../../middleware/auth.middleware.js';
import { auditMiddleware } from '../../middleware/auditLog.js';
import * as schema from './courses.schema.js';

const router = Router();
router.use(verifyToken);

router.post('/', requireRole('super_admin', 'admin'), validate(schema.courseSchema), auditMiddleware('CREATE_COURSE', 'courses'), courseController.createCourse);
router.get('/', courseController.getAllCourses);
router.get('/:id', courseController.getCourseById);
router.patch('/:id', requireRole('super_admin', 'admin'), validate(schema.courseSchema), auditMiddleware('UPDATE_COURSE', 'courses'), courseController.updateCourse);
router.delete('/:id', requireRole('super_admin', 'admin'), auditMiddleware('DELETE_COURSE', 'courses'), courseController.deleteCourse);
router.post('/:id/enroll', courseController.enrollStudent);
router.get('/:id/students', requireRole('super_admin', 'admin', 'teacher'), courseController.getCourseStudents);

export default router;
