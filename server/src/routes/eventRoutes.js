import { Router } from 'express';
import {
  getEvents,
  getEvent,
  createEvent,
  updateEvent,
  deleteEvent,
} from '../controllers/eventController.js';
import { ensureAuthenticated } from '../middleware/auth.js';

const router = Router();

// Public routes
router.get('/', getEvents);
router.get('/:id', getEvent);

// Protected routes
router.post('/', ensureAuthenticated, createEvent);
router.put('/:id', ensureAuthenticated, updateEvent);
router.delete('/:id', ensureAuthenticated, deleteEvent);

export default router;

