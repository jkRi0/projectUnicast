import Event from '../models/Event.js';
import User from '../models/User.js';
import Message from '../models/Message.js';
import EmailService from '../services/emailService.js';
import SMSService from '../services/smsService.js';

const emailService = new EmailService();
const smsService = new SMSService();

/**
 * Send invitations to event participants
 * POST /api/events/:id/invitations
 */
export const sendInvitations = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { id: eventId } = req.params;
    const { recipientIds, channels = ['email'] } = req.body;

    if (!recipientIds || !Array.isArray(recipientIds) || recipientIds.length === 0) {
      return res.status(400).json({ error: 'Recipient IDs are required' });
    }

    if (!channels || !Array.isArray(channels) || channels.length === 0) {
      return res.status(400).json({ error: 'At least one channel (email or sms) is required' });
    }

    const event = await Event.findById(eventId).populate('organizer', 'username email');

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Verify user is the organizer
    if (event.organizer._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Only the event organizer can send invitations' });
    }

    // Get recipients
    const recipients = await User.find({ _id: { $in: recipientIds } });

    if (recipients.length === 0) {
      return res.status(400).json({ error: 'No valid recipients found' });
    }

    const results = [];
    const errors = [];

    // Send invitations to each recipient via selected channels
    for (const recipient of recipients) {
      for (const channel of channels) {
        try {
          // Create message record
          const message = await Message.create({
            event: eventId,
            sender: req.user._id,
            recipient: recipient._id,
            type: 'invitation',
            channel: channel,
            subject: `Invitation: ${event.title}`,
            content: `You're invited to ${event.title}`,
            status: 'pending',
          });

          let sendResult;

          if (channel === 'email') {
            if (!recipient.email) {
              errors.push({ recipient: recipient.username, channel, error: 'No email address' });
              await Message.findByIdAndUpdate(message._id, {
                status: 'failed',
                error: 'Recipient has no email address',
              });
              continue;
            }

            sendResult = await emailService.sendInvitation(event, recipient, message._id.toString());
          } else if (channel === 'sms') {
            if (!recipient.phone) {
              errors.push({ recipient: recipient.username, channel, error: 'No phone number' });
              await Message.findByIdAndUpdate(message._id, {
                status: 'failed',
                error: 'Recipient has no phone number',
              });
              continue;
            }

            sendResult = await smsService.sendInvitation(event, recipient, message._id.toString());
          } else {
            errors.push({ recipient: recipient.username, channel, error: 'Invalid channel' });
            continue;
          }

          if (sendResult.success) {
            results.push({
              recipient: recipient.username,
              channel,
              messageId: message._id,
              status: 'sent',
            });
          } else {
            errors.push({
              recipient: recipient.username,
              channel,
              error: sendResult.error || 'Failed to send',
            });
          }
        } catch (error) {
          console.error(`Error sending ${channel} to ${recipient.username}:`, error);
          errors.push({
            recipient: recipient.username,
            channel,
            error: error.message,
          });
        }
      }
    }

    return res.json({
      success: true,
      sent: results.length,
      failed: errors.length,
      results,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error('Error sending invitations:', error);
    return res.status(500).json({ error: 'Failed to send invitations' });
  }
};

/**
 * Send reminders to event participants
 * POST /api/events/:id/reminders
 */
export const sendReminders = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { id: eventId } = req.params;
    const { recipientIds, channels = ['email'] } = req.body;

    const event = await Event.findById(eventId).populate('organizer', 'username email');

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    if (event.organizer._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Only the event organizer can send reminders' });
    }

    const recipients = await User.find({ _id: { $in: recipientIds } });
    const results = [];
    const errors = [];

    for (const recipient of recipients) {
      for (const channel of channels) {
        try {
          const message = await Message.create({
            event: eventId,
            sender: req.user._id,
            recipient: recipient._id,
            type: 'reminder',
            channel: channel,
            subject: `Reminder: ${event.title}`,
            content: `Reminder: ${event.title} is coming up`,
            status: 'pending',
          });

          let sendResult;

          if (channel === 'email') {
            if (!recipient.email) {
              errors.push({ recipient: recipient.username, channel, error: 'No email address' });
              continue;
            }
            sendResult = await emailService.sendReminder(event, recipient, message._id.toString());
          } else if (channel === 'sms') {
            if (!recipient.phone) {
              errors.push({ recipient: recipient.username, channel, error: 'No phone number' });
              continue;
            }
            sendResult = await smsService.sendReminder(event, recipient, message._id.toString());
          }

          if (sendResult && sendResult.success) {
            results.push({
              recipient: recipient.username,
              channel,
              messageId: message._id,
              status: 'sent',
            });
          } else {
            errors.push({
              recipient: recipient.username,
              channel,
              error: sendResult?.error || 'Failed to send',
            });
          }
        } catch (error) {
          errors.push({
            recipient: recipient.username,
            channel,
            error: error.message,
          });
        }
      }
    }

    return res.json({
      success: true,
      sent: results.length,
      failed: errors.length,
      results,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error('Error sending reminders:', error);
    return res.status(500).json({ error: 'Failed to send reminders' });
  }
};

/**
 * Get message history for an event
 * GET /api/events/:id/messages
 */
export const getMessages = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { id: eventId } = req.params;

    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Only organizer can view messages
    if (event.organizer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Only the event organizer can view messages' });
    }

    const messages = await Message.find({ event: eventId })
      .populate('recipient', 'username email phone')
      .populate('sender', 'username')
      .sort({ createdAt: -1 });

    return res.json({ messages });
  } catch (error) {
    console.error('Error fetching messages:', error);
    return res.status(500).json({ error: 'Failed to fetch messages' });
  }
};

