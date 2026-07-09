import { Router } from 'express';
import * as userController from './users.controller.js';
import { validate } from '../../middleware/validate.js';
import { verifyToken, requireRole } from '../../middleware/auth.middleware.js';
import { auditMiddleware } from '../../middleware/auditLog.js';
import { uploadMemory } from '../../middleware/upload.js';
import * as schema from './users.schema.js';

const router = Router();

router.use(verifyToken);
// Only super_admin and admin can manage users
router.use(requireRole('super_admin', 'admin'));

// Middleware to parse form-data strings to boolean for users
const parseUserForm = (req, res, next) => {
  if (req.body) {
    if (req.body.is_active !== undefined) {
      req.body.is_active = req.body.is_active === 'true' || req.body.is_active === true;
    }
  }
  next();
};

router.post(
  '/',
  uploadMemory.single('avatar'),
  parseUserForm,
  validate(schema.createUserSchema),
  auditMiddleware('CREATE_USER', 'users'),
  userController.createUser
);

router.get('/', userController.listUsers);
router.get('/:id', userController.getUserById);

router.patch(
  '/:id',
  uploadMemory.single('avatar'),
  parseUserForm,
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
