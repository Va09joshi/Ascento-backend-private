import express from 'express';
import * as feesController from './fees.controller.js';
import { verifyToken, requireRole } from '../../middleware/auth.middleware.js';

const router = express.Router();

router.use(verifyToken);

// Admin endpoints
router.post('/structures', requireRole('super_admin', 'admin'), feesController.createFeeStructure);
router.get('/structures', requireRole('super_admin', 'admin'), feesController.listFeeStructures);

router.post('/records', requireRole('super_admin', 'admin'), feesController.createFeeRecord);
router.get('/records', requireRole('super_admin', 'admin', 'teacher'), feesController.listFeeRecords);
router.put('/records/:id', requireRole('super_admin', 'admin'), feesController.updateFeeRecord);

export default router;
