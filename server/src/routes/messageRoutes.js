import { Router } from 'express';
import {
  sendInvitations,
  sendReminders,
  getMessages,
} from '../controllers/messageController.js';
import { ensureAuthenticated } from '../middleware/auth.js';

const router = Router();

// All message routes require authentication
router.use(ensureAuthenticated);

// Send invitations to event participants
router.post('/:id/invitations', sendInvitations);

// Send reminders to event participants
router.post('/:id/reminders', sendReminders);

// Get message history for an event
router.get('/:id/messages', getMessages);

export default router;

