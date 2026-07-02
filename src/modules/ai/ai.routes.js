import { Router } from 'express';
import * as aiController from './ai.controller.js';
import { validate } from '../../middleware/validate.js';
import { verifyToken, requireRole } from '../../middleware/auth.middleware.js';
import * as schema from './ai.schema.js';

const router = Router();
router.use(verifyToken);
router.use(requireRole('super_admin', 'admin', 'teacher'));

router.post('/student-report', validate(schema.aiReportSchema), aiController.generateStudentReport);

export default router;
