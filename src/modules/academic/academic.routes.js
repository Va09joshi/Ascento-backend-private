import { Router } from 'express';
import * as academicController from './academic.controller.js';
import { validate } from '../../middleware/validate.js';
import { verifyToken, requireRole } from '../../middleware/auth.middleware.js';
import { auditMiddleware } from '../../middleware/auditLog.js';
import * as schema from './academic.schema.js';

const router = Router();

router.use(verifyToken);

router.post(
  '/',
  requireRole('super_admin', 'admin'),
  validate(schema.academicYearSchema),
  auditMiddleware('CREATE_ACADEMIC_YEAR', 'academic_years'),
  academicController.createAcademicYear
);

router.get('/', academicController.getAllAcademicYears);
router.get('/current', academicController.getCurrentAcademicYear);

router.patch(
  '/:id',
  requireRole('super_admin', 'admin'),
  validate(schema.academicYearSchema), // using same schema, zod object().optional() might be needed for partial, but keeping simple
  auditMiddleware('UPDATE_ACADEMIC_YEAR', 'academic_years'),
  academicController.updateAcademicYear
);

router.post(
  '/:id/set-current',
  requireRole('super_admin', 'admin'),
  auditMiddleware('SET_CURRENT_ACADEMIC_YEAR', 'academic_years'),
  academicController.setCurrentAcademicYear
);

export default router;
