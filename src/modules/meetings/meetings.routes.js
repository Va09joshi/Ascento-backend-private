import express from 'express';
import * as MeetingsController from './meetings.controller.js';
import { validate } from '../../middleware/validator.js';
import { authenticate, authorize } from '../../middleware/auth.js';
import { createMeetingSchema } from './meetings.schema.js';

const router = express.Router();

router.use(authenticate);

// List meetings (everyone)
router.get('/', MeetingsController.getMeetings);

// Teacher/Admin actions
router.post('/', authorize('teacher', 'admin', 'super_admin'), validate(createMeetingSchema), MeetingsController.createMeeting);
router.delete('/:id', authorize('teacher', 'admin', 'super_admin'), MeetingsController.deleteMeeting);

export default router;
