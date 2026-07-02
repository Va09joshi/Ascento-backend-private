import { Router } from 'express';
import * as paymentController from './payments.controller.js';
import { validate } from '../../middleware/validate.js';
import { verifyToken, requireRole } from '../../middleware/auth.middleware.js';
import * as schema from './payments.schema.js';

const router = Router();

// Webhook doesn't need auth
router.post('/webhook', paymentController.razorpayWebhook);

router.use(verifyToken);

router.post('/create-order', validate(schema.createOrderSchema), paymentController.createOrder);
router.post('/verify', validate(schema.verifyPaymentSchema), paymentController.verifyPayment);
router.get('/history', paymentController.getPaymentHistory);
router.get('/', requireRole('super_admin', 'admin'), paymentController.getAllPayments);

export default router;
