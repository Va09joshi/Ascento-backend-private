import express from 'express';
import * as enquiriesController from './enquiries.controller.js';
import { requireAuth, requireRole } from '../../middleware/auth.js';

const router = express.Router();

router.post('/', enquiriesController.createEnquiry); // Public endpoint for enquiries

router.use(requireAuth, requireRole(['super_admin', 'admin']));
router.get('/', enquiriesController.listEnquiries);
router.get('/:id', enquiriesController.getEnquiryById);
router.put('/:id', enquiriesController.updateEnquiry);
router.delete('/:id', enquiriesController.deleteEnquiry);

export default router;
