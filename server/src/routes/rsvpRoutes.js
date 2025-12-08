import { Router } from 'express';
import {
  getRSVP,
  submitRSVP,
  updateRSVP,
  getEventRSVPs,
} from '../controllers/rsvpController.js';
import { ensureAuthenticated } from '../middleware/auth.js';

const router = Router({ mergeParams: true });

// All RSVP routes require authentication
router.get('/:id/rsvp', ensureAuthenticated, getRSVP);
router.post('/:id/rsvp', ensureAuthenticated, submitRSVP);
router.put('/:id/rsvp', ensureAuthenticated, updateRSVP);
router.get('/:id/rsvp/all', ensureAuthenticated, getEventRSVPs);

export default router;

