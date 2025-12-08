import { Router } from 'express';
import {
  getFeedback,
  submitFeedback,
  getEventFeedback,
} from '../controllers/feedbackController.js';
import { ensureAuthenticated } from '../middleware/auth.js';

const router = Router({ mergeParams: true });

// All feedback routes require authentication
router.get('/:id/feedback', ensureAuthenticated, getFeedback);
router.post('/:id/feedback', ensureAuthenticated, submitFeedback);
router.get('/:id/feedback/all', ensureAuthenticated, getEventFeedback);

export default router;

