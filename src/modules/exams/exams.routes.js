import { Router } from 'express';
import * as examController from './exams.controller.js';
import { validate } from '../../middleware/validate.js';
import { verifyToken, requireRole } from '../../middleware/auth.middleware.js';
import { auditMiddleware } from '../../middleware/auditLog.js';
import * as schema from './exams.schema.js';

const router = Router();
router.use(verifyToken);

router.post('/', requireRole('super_admin', 'admin'), validate(schema.examSchema), auditMiddleware('CREATE_EXAM', 'exams'), examController.createExam);
router.get('/', examController.getExams);
router.get('/:id', examController.getExamById);
router.patch('/:id', requireRole('super_admin', 'admin'), auditMiddleware('UPDATE_EXAM', 'exams'), examController.updateExam);
router.delete('/:id', requireRole('super_admin', 'admin'), auditMiddleware('DELETE_EXAM', 'exams'), examController.deleteExam);

// Results
router.post('/:id/results', requireRole('super_admin', 'admin', 'teacher'), validate(schema.resultSchema), auditMiddleware('ENTER_RESULTS', 'exam_results'), examController.enterResults);
router.get('/:id/results', requireRole('super_admin', 'admin', 'teacher'), examController.getExamResults);
router.get('/:id/results/my', examController.getMyResult);

export default router;
