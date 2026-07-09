import express from 'express';
import * as enquiriesController from './enquiries.controller.js';
import { verifyToken, requireRole } from '../../middleware/auth.middleware.js';

const router = express.Router();

router.post('/', enquiriesController.createEnquiry); // Public endpoint for enquiries

router.use(verifyToken, requireRole('super_admin', 'admin'));
router.get('/', enquiriesController.listEnquiries);
router.get('/:id', enquiriesController.getEnquiryById);
router.put('/:id', enquiriesController.updateEnquiry);
router.delete('/:id', enquiriesController.deleteEnquiry);

export default router;
