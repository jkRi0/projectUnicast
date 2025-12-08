import RSVP from '../models/RSVP.js';
import Event from '../models/Event.js';

const sanitizeRSVP = (rsvp) => {
  if (!rsvp) return null;
  const obj = rsvp.toObject ? rsvp.toObject() : rsvp;
  return obj;
};

export const getRSVP = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { id: eventId } = req.params;
    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    const rsvp = await RSVP.findOne({
      event: eventId,
      user: req.user._id,
    }).populate('event', 'title date time location');

    if (!rsvp) {
      return res.status(404).json({ error: 'RSVP not found' });
    }

    return res.json({ rsvp: sanitizeRSVP(rsvp) });
  } catch (error) {
    console.error('Error fetching RSVP:', error);
    return res.status(500).json({ error: 'Failed to fetch RSVP' });
  }
};

export const submitRSVP = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { id: eventId } = req.params;
    const { status, notes } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'RSVP status is required' });
    }

    if (!['pending', 'confirmed', 'declined', 'maybe'].includes(status)) {
      return res.status(400).json({ error: 'Invalid RSVP status' });
    }

    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    if (!event.requiresRSVP) {
      return res.status(400).json({ error: 'This event does not require RSVP' });
    }

    // Check if RSVP already exists
    let rsvp = await RSVP.findOne({
      event: eventId,
      user: req.user._id,
    });

    if (rsvp) {
      // Update existing RSVP
      rsvp.status = status;
      rsvp.notes = notes || '';
      rsvp.respondedAt = new Date();
      await rsvp.save();
    } else {
      // Create new RSVP
      rsvp = await RSVP.create({
        event: eventId,
        user: req.user._id,
        status,
        notes: notes || '',
        respondedAt: new Date(),
      });
    }

    const populatedRSVP = await RSVP.findById(rsvp._id)
      .populate('event', 'title date time location')
      .populate('user', 'username email');

    return res.json({ rsvp: sanitizeRSVP(populatedRSVP) });
  } catch (error) {
    console.error('Error submitting RSVP:', error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors || {}).map((err) => err.message);
      return res.status(400).json({ error: messages[0] || 'Invalid RSVP data' });
    }
    return res.status(500).json({ error: 'Failed to submit RSVP' });
  }
};

export const updateRSVP = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { id: eventId } = req.params;
    const { status, notes } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'RSVP status is required' });
    }

    if (!['pending', 'confirmed', 'declined', 'maybe'].includes(status)) {
      return res.status(400).json({ error: 'Invalid RSVP status' });
    }

    const rsvp = await RSVP.findOne({
      event: eventId,
      user: req.user._id,
    });

    if (!rsvp) {
      return res.status(404).json({ error: 'RSVP not found' });
    }

    rsvp.status = status;
    if (notes !== undefined) rsvp.notes = notes;
    rsvp.respondedAt = new Date();
    await rsvp.save();

    const populatedRSVP = await RSVP.findById(rsvp._id)
      .populate('event', 'title date time location')
      .populate('user', 'username email');

    return res.json({ rsvp: sanitizeRSVP(populatedRSVP) });
  } catch (error) {
    console.error('Error updating RSVP:', error);
    return res.status(500).json({ error: 'Failed to update RSVP' });
  }
};

export const getEventRSVPs = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { id: eventId } = req.params;
    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Only organizer can see all RSVPs
    if (event.organizer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Only event organizer can view all RSVPs' });
    }

    const rsvps = await RSVP.find({ event: eventId })
      .populate('user', 'username email')
      .sort({ createdAt: -1 });

    return res.json({ rsvps: rsvps.map(sanitizeRSVP) });
  } catch (error) {
    console.error('Error fetching event RSVPs:', error);
    return res.status(500).json({ error: 'Failed to fetch RSVPs' });
  }
};

