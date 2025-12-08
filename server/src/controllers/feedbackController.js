import Feedback from '../models/Feedback.js';
import Event from '../models/Event.js';

const sanitizeFeedback = (feedback) => {
  if (!feedback) return null;
  const obj = feedback.toObject ? feedback.toObject() : feedback;
  return obj;
};

export const getFeedback = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { id: eventId } = req.params;
    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    const feedback = await Feedback.findOne({
      event: eventId,
      user: req.user._id,
    }).populate('event', 'title date');

    if (!feedback) {
      return res.status(404).json({ error: 'Feedback not found' });
    }

    return res.json({ feedback: sanitizeFeedback(feedback) });
  } catch (error) {
    console.error('Error fetching feedback:', error);
    return res.status(500).json({ error: 'Failed to fetch feedback' });
  }
};

export const submitFeedback = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { id: eventId } = req.params;
    const { rating, comment, suggestions, wouldAttendAgain } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Check if feedback already exists
    let feedback = await Feedback.findOne({
      event: eventId,
      user: req.user._id,
    });

    if (feedback) {
      // Update existing feedback
      feedback.rating = rating;
      feedback.comment = comment || '';
      feedback.suggestions = suggestions || '';
      feedback.wouldAttendAgain = wouldAttendAgain;
      await feedback.save();
    } else {
      // Create new feedback
      feedback = await Feedback.create({
        event: eventId,
        user: req.user._id,
        rating,
        comment: comment || '',
        suggestions: suggestions || '',
        wouldAttendAgain,
      });
    }

    const populatedFeedback = await Feedback.findById(feedback._id)
      .populate('event', 'title date')
      .populate('user', 'username email');

    return res.json({ feedback: sanitizeFeedback(populatedFeedback) });
  } catch (error) {
    console.error('Error submitting feedback:', error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors || {}).map((err) => err.message);
      return res.status(400).json({ error: messages[0] || 'Invalid feedback data' });
    }
    return res.status(500).json({ error: 'Failed to submit feedback' });
  }
};

export const getEventFeedback = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { id: eventId } = req.params;
    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Only organizer can see all feedback
    if (event.organizer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Only event organizer can view all feedback' });
    }

    const feedbacks = await Feedback.find({ event: eventId })
      .populate('user', 'username email')
      .sort({ createdAt: -1 });

    const averageRating =
      feedbacks.length > 0
        ? feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length
        : 0;

    return res.json({
      feedbacks: feedbacks.map(sanitizeFeedback),
      averageRating: Math.round(averageRating * 10) / 10,
      totalCount: feedbacks.length,
    });
  } catch (error) {
    console.error('Error fetching event feedback:', error);
    return res.status(500).json({ error: 'Failed to fetch feedback' });
  }
};

