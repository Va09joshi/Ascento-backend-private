import { Router } from 'express';
import * as userController from './users.controller.js';
import { validate } from '../../middleware/validate.js';
import { verifyToken, requireRole } from '../../middleware/auth.middleware.js';
import { auditMiddleware } from '../../middleware/auditLog.js';
import * as schema from './users.schema.js';

const router = Router();

router.use(verifyToken);
// Only super_admin and admin can manage users
router.use(requireRole('super_admin', 'admin'));

router.post(
  '/',
  validate(schema.createUserSchema),
  auditMiddleware('CREATE_USER', 'users'),
  userController.createUser
);

router.get('/', userController.listUsers);
router.get('/:id', userController.getUserById);

router.patch(
  '/:id',
  validate(schema.updateUserSchema),
  auditMiddleware('UPDATE_USER', 'users'),
  userController.updateUser
);

router.delete(
  '/:id',
  auditMiddleware('DEACTIVATE_USER', 'users'),
  userController.deactivateUser
);

router.post(
  '/link-parent',
  validate(schema.linkParentSchema),
  auditMiddleware('LINK_PARENT', 'parent_student'),
  userController.linkParent
);

export default router;
