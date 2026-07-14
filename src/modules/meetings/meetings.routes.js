import express from 'express';
import * as MeetingsController from './meetings.controller.js';
import { verifyToken, requireRole } from '../../middleware/auth.middleware.js';

const router = express.Router();

router.use(verifyToken);

// List meetings (everyone)
router.get('/', MeetingsController.getMeetings);

// Teacher/Admin actions
router.post('/', requireRole('teacher', 'admin', 'super_admin'), MeetingsController.createMeeting);
router.put('/:id', requireRole('teacher', 'admin', 'super_admin'), MeetingsController.updateMeeting);
router.delete('/:id', requireRole('teacher', 'admin', 'super_admin'), MeetingsController.deleteMeeting);

export default router;
