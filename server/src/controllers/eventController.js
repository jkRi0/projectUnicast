import Event from '../models/Event.js';
import User from '../models/User.js';

const sanitizeEvent = (event) => {
  if (!event) return null;
  const obj = event.toObject ? event.toObject() : event;
  return obj;
};

export const getEvents = async (req, res, next) => {
  try {
    const events = await Event.find()
      .populate('organizer', 'username email')
      .sort({ date: 1, createdAt: -1 });

    return res.json({ events: events.map(sanitizeEvent) });
  } catch (error) {
    console.error('Error fetching events:', error);
    return res.status(500).json({ error: 'Failed to fetch events' });
  }
};

export const getEvent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const event = await Event.findById(id).populate('organizer', 'username email');

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    return res.json({ event: sanitizeEvent(event) });
  } catch (error) {
    console.error('Error fetching event:', error);
    return res.status(500).json({ error: 'Failed to fetch event' });
  }
};

export const createEvent = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { title, description, date, time, location, maxAttendees, requiresRSVP } = req.body;

    if (!title || !date) {
      return res.status(400).json({ error: 'Title and date are required' });
    }

    const event = await Event.create({
      title,
      description,
      date,
      time,
      location,
      maxAttendees: maxAttendees ? parseInt(maxAttendees) : undefined,
      requiresRSVP: requiresRSVP !== false,
      organizer: req.user._id,
      status: 'published',
    });

    const populatedEvent = await Event.findById(event._id).populate('organizer', 'username email');

    return res.status(201).json({ event: sanitizeEvent(populatedEvent) });
  } catch (error) {
    console.error('Error creating event:', error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors || {}).map((err) => err.message);
      return res.status(400).json({ error: messages[0] || 'Invalid event data' });
    }
    return res.status(500).json({ error: 'Failed to create event' });
  }
};

export const updateEvent = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { id } = req.params;
    const event = await Event.findById(id);

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Check if user is the organizer
    if (event.organizer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'You can only edit your own events' });
    }

    const { title, description, date, time, location, maxAttendees, requiresRSVP, status } = req.body;

    if (title) event.title = title;
    if (description !== undefined) event.description = description;
    if (date) event.date = date;
    if (time !== undefined) event.time = time;
    if (location !== undefined) event.location = location;
    if (maxAttendees !== undefined) event.maxAttendees = maxAttendees ? parseInt(maxAttendees) : undefined;
    if (requiresRSVP !== undefined) event.requiresRSVP = requiresRSVP;
    if (status) event.status = status;

    await event.save();

    const populatedEvent = await Event.findById(event._id).populate('organizer', 'username email');

    return res.json({ event: sanitizeEvent(populatedEvent) });
  } catch (error) {
    console.error('Error updating event:', error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors || {}).map((err) => err.message);
      return res.status(400).json({ error: messages[0] || 'Invalid event data' });
    }
    return res.status(500).json({ error: 'Failed to update event' });
  }
};

export const deleteEvent = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { id } = req.params;
    const event = await Event.findById(id);

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Check if user is the organizer
    if (event.organizer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'You can only delete your own events' });
    }

    await Event.findByIdAndDelete(id);

    return res.status(204).send();
  } catch (error) {
    console.error('Error deleting event:', error);
    return res.status(500).json({ error: 'Failed to delete event' });
  }
};

