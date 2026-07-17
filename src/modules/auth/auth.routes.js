import { Router } from 'express';
import * as authController from './auth.controller.js';
import { validate } from '../../middleware/validate.js';
import { verifyToken, requirePasswordChanged } from '../../middleware/auth.middleware.js';
import { rateLimit } from '../../middleware/rateLimit.js';
import * as schema from './auth.schema.js';

const router = Router();

// Apply a stricter rate limit to auth routes
const authRateLimit = rateLimit(10, 60);

router.post('/login', authRateLimit, validate(schema.loginSchema), authController.login);
router.post('/refresh', authRateLimit, validate(schema.refreshSchema), authController.refresh);
router.post('/logout', verifyToken, authController.logout);

router.post(
  '/change-password',
  verifyToken,
  validate(schema.changePasswordSchema),
  authController.changePassword
);

router.post('/forgot-password', authRateLimit, validate(schema.forgotPasswordSchema), authController.forgotPassword);
router.post('/reset-password', authRateLimit, validate(schema.resetPasswordSchema), authController.resetPassword);

router.get('/me', verifyToken, requirePasswordChanged, authController.getMe);
router.patch('/me', verifyToken, validate(schema.updateProfileSchema), authController.updateMe);

export default router;
