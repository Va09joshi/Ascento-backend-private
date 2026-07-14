import express from 'express';
import { verifyToken } from '../../middleware/auth.middleware.js';
import { uploadPdf, uploadVideo } from '../../middleware/upload.js';
import * as UploadsController from './uploads.controller.js';

const router = express.Router();
router.use(verifyToken);

// Upload document endpoint
router.post('/document', uploadVideo.single('file'), UploadsController.uploadDocument);

// Upload avatar endpoint 
router.post('/avatar', uploadVideo.single('file'), UploadsController.uploadAvatar);

export default router;
