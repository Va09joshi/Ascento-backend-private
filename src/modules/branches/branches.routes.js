import { Router } from 'express';
import * as branchController from './branches.controller.js';
import { validate } from '../../middleware/validate.js';
import { verifyToken, requireRole } from '../../middleware/auth.middleware.js';
import { auditMiddleware } from '../../middleware/auditLog.js';
import * as schema from './branches.schema.js';

const router = Router();

router.use(verifyToken);

router.post(
  '/',
  requireRole('super_admin', 'admin'),
  validate(schema.branchSchema),
  auditMiddleware('CREATE_BRANCH', 'branches'),
  branchController.createBranch
);

router.get('/', branchController.getAllBranches);
router.get('/:id', branchController.getBranchById);

router.patch(
  '/:id',
  requireRole('super_admin', 'admin'),
  validate(schema.branchSchema),
  auditMiddleware('UPDATE_BRANCH', 'branches'),
  branchController.updateBranch
);

router.delete(
  '/:id',
  requireRole('super_admin', 'admin'),
  auditMiddleware('DELETE_BRANCH', 'branches'),
  branchController.deleteBranch
);

export default router;
