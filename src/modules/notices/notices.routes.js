import { Router } from 'express';
import * as noticesController from './notices.controller.js';
import { validate } from '../../middleware/validate.js';
import { verifyToken, requireRole } from '../../middleware/auth.middleware.js';
import { auditMiddleware } from '../../middleware/auditLog.js';
import { uploadMemory } from '../../middleware/upload.js';
import * as schema from './notices.schema.js';

const router = Router();
router.use(verifyToken);

// Middleware to parse form-data strings to boolean for notices
const parseNoticeForm = (req, res, next) => {
  if (req.body && req.body.is_published !== undefined) {
    req.body.is_published = req.body.is_published === 'true' || req.body.is_published === true;
  }
  next();
};

router.post('/', requireRole('super_admin', 'admin'), uploadMemory.single('image'), parseNoticeForm, validate(schema.createNoticeSchema), auditMiddleware('CREATE_NOTICE', 'notices'), noticesController.createNotice);
router.get('/', noticesController.getNotices);
router.get('/:id', noticesController.getNoticeById);
router.patch('/:id', requireRole('super_admin', 'admin'), uploadMemory.single('image'), parseNoticeForm, validate(schema.updateNoticeSchema), auditMiddleware('UPDATE_NOTICE', 'notices'), noticesController.updateNotice);
router.delete('/:id', requireRole('super_admin', 'admin'), auditMiddleware('DELETE_NOTICE', 'notices'), noticesController.deleteNotice);

export default router;
