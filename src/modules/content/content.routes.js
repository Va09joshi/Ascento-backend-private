import { Router } from 'express';
import * as contentController from './content.controller.js';
import { validate } from '../../middleware/validate.js';
import { verifyToken, requireRole } from '../../middleware/auth.middleware.js';
import { auditMiddleware } from '../../middleware/auditLog.js';
import { uploadPdf, uploadVideo } from '../../middleware/upload.js';
import * as schema from './content.schema.js';

const router = Router();
router.use(verifyToken);

// Handle multiple file types through different routes or a single dynamic one. Let's use uploadVideo for generous limit here, or could write a dynamic multer middleware.
router.post('/', requireRole('super_admin', 'admin', 'teacher'), uploadVideo.single('file'), auditMiddleware('UPLOAD_CONTENT', 'content_items'), contentController.uploadContent);
router.get('/', contentController.getContent);
router.get('/:id/stream', contentController.getStreamUrl);
router.patch('/:id', requireRole('super_admin', 'admin', 'teacher'), validate(schema.updateContentSchema), contentController.updateContent);
router.delete('/:id', requireRole('super_admin', 'admin', 'teacher'), auditMiddleware('DELETE_CONTENT', 'content_items'), contentController.deleteContent);

export default router;
