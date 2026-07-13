import express from 'express';
import * as HomeworkController from './homework.controller.js';
import { verifyToken, requireRole } from '../../middleware/auth.middleware.js';

const router = express.Router();

router.use(verifyToken);

// List homework (everyone)
router.get('/', HomeworkController.getHomeworks);

// Teacher/Admin actions
router.post('/', requireRole('teacher', 'admin', 'super_admin'), HomeworkController.createHomework);
router.get('/:id/submissions', requireRole('teacher', 'admin', 'super_admin'), HomeworkController.getSubmissions);
router.patch('/submissions/:submission_id/grade', requireRole('teacher', 'admin', 'super_admin'), HomeworkController.gradeHomework);

// Student actions
router.post('/:id/submit', requireRole('student'), HomeworkController.submitHomework);

export default router;
