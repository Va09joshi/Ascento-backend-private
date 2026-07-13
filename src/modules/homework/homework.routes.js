import express from 'express';
import * as HomeworkController from './homework.controller.js';
import { validate } from '../../middleware/validator.js';
import { authenticate, authorize } from '../../middleware/auth.js';
import { createHomeworkSchema, submitHomeworkSchema, gradeHomeworkSchema } from './homework.schema.js';

const router = express.Router();

router.use(authenticate);

// List homework (everyone)
router.get('/', HomeworkController.getHomeworks);

// Teacher/Admin actions
router.post('/', authorize('teacher', 'admin', 'super_admin'), validate(createHomeworkSchema), HomeworkController.createHomework);
router.get('/:id/submissions', authorize('teacher', 'admin', 'super_admin'), HomeworkController.getSubmissions);
router.patch('/submissions/:submission_id/grade', authorize('teacher', 'admin', 'super_admin'), validate(gradeHomeworkSchema), HomeworkController.gradeHomework);

// Student actions
router.post('/:id/submit', authorize('student'), validate(submitHomeworkSchema), HomeworkController.submitHomework);

export default router;
