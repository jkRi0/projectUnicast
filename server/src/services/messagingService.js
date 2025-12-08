import Message from '../models/Message.js';
import User from '../models/User.js';
import Event from '../models/Event.js';

/**
 * Base messaging service interface
 * This will be extended by specific implementations (SMS, Email)
 */
class MessagingService {
  /**
   * Send a message via the service
   * @param {Object} options - Message options
   * @returns {Promise<Object>} - Result with status and messageId
   */
  async send(options) {
    throw new Error('send() must be implemented by subclass');
  }

  /**
   * Create a message record in the database
   * @param {Object} messageData - Message data
   * @returns {Promise<Message>} - Created message document
   */
  async createMessageRecord(messageData) {
    return await Message.create(messageData);
  }

  /**
   * Update message status
   * @param {String} messageId - Message ID
   * @param {String} status - New status
   * @param {String} externalId - External service message ID
   * @param {String} error - Error message if failed
   */
  async updateMessageStatus(messageId, status, externalId = null, error = null) {
    const update = { status, sentAt: new Date() };
    if (externalId) update.externalId = externalId;
    if (error) update.error = error;
    
    await Message.findByIdAndUpdate(messageId, update);
  }

  /**
   * Get recipient contact information
   * @param {String} userId - User ID
   * @param {String} channel - 'email' or 'sms'
   * @returns {Promise<Object>} - Contact info
   */
  async getRecipientContact(userId, channel) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    if (channel === 'email') {
      if (!user.email) {
        throw new Error('User email not found');
      }
      return { email: user.email, name: user.username };
    }

    if (channel === 'sms') {
      if (!user.phone) {
        throw new Error('User phone number not found');
      }
      return { phone: user.phone, name: user.username };
    }

    throw new Error(`Unsupported channel: ${channel}`);
  }

  /**
   * Check if user has notifications enabled for channel
   * @param {String} userId - User ID
   * @param {String} channel - 'email' or 'sms'
   * @returns {Promise<Boolean>}
   */
  async isNotificationEnabled(userId, channel) {
    const user = await User.findById(userId);
    if (!user) return false;

    if (channel === 'email') {
      return user.preferences?.emailNotifications !== false;
    }

    if (channel === 'sms') {
      return user.preferences?.smsNotifications === true;
    }

    return false;
  }
}

export default MessagingService;

