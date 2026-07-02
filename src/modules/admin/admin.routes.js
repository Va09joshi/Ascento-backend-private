import { Router } from 'express';
import * as adminController from './admin.controller.js';
import { verifyToken, requireRole } from '../../middleware/auth.middleware.js';

const router = Router();

router.use(verifyToken);
router.use(requireRole('super_admin', 'admin'));

router.get('/dashboard', adminController.getDashboardStats);

export default router;
