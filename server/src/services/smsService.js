import MessagingService from './messagingService.js';

/**
 * SMS service using Twilio
 * This is a placeholder that will be implemented with Twilio API
 */
class SMSService extends MessagingService {
  constructor() {
    super();
    // Twilio credentials will be loaded from environment variables
    this.accountSid = process.env.TWILIO_ACCOUNT_SID;
    this.authToken = process.env.TWILIO_AUTH_TOKEN;
    this.fromNumber = process.env.TWILIO_PHONE_NUMBER;
  }

  /**
   * Send an SMS via Twilio
   * @param {Object} options - SMS options
   * @param {String} options.to - Recipient phone number (E.164 format)
   * @param {String} options.body - SMS message body
   * @param {String} options.messageId - Database message ID for tracking
   * @returns {Promise<Object>} - Result with status and externalId
   */
  async send(options) {
    const { to, body, messageId } = options;

    if (!this.accountSid || !this.authToken || !this.fromNumber) {
      console.warn('Twilio credentials not configured. SMS not sent.');
      if (messageId) {
        await this.updateMessageStatus(messageId, 'failed', null, 'Twilio credentials not configured');
      }
      return { success: false, error: 'SMS service not configured' };
    }

    try {
      // TODO: Implement actual Twilio API call
      // This will be implemented in the integration guide
      const response = await this.sendViaTwilio({
        to,
        body,
      });

      if (messageId) {
        await this.updateMessageStatus(messageId, 'sent', response.sid);
      }

      return {
        success: true,
        messageId: response.sid,
        externalId: response.sid,
      };
    } catch (error) {
      console.error('SMS send error:', error);
      
      if (messageId) {
        await this.updateMessageStatus(messageId, 'failed', null, error.message);
      }

      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Placeholder for Twilio API implementation
   * This will be implemented in the integration guide
   */
  async sendViaTwilio({ to, body }) {
    // Placeholder - will be implemented with actual Twilio SDK
    throw new Error('Twilio integration not yet implemented. See integration guide.');
  }

  /**
   * Send event invitation SMS
   * @param {Object} event - Event document
   * @param {Object} recipient - User document
   * @param {String} messageId - Database message ID
   * @returns {Promise<Object>}
   */
  async sendInvitation(event, recipient, messageId) {
    const body = this.generateInvitationText(event, recipient);
    return await this.send({
      to: recipient.phone || recipient.phoneNumber,
      body,
      messageId,
    });
  }

  /**
   * Send event reminder SMS
   * @param {Object} event - Event document
   * @param {Object} recipient - User document
   * @param {String} messageId - Database message ID
   * @returns {Promise<Object>}
   */
  async sendReminder(event, recipient, messageId) {
    const body = this.generateReminderText(event, recipient);
    return await this.send({
      to: recipient.phone,
      body,
      messageId,
    });
  }

  /**
   * Send thank you SMS after event
   * @param {Object} event - Event document
   * @param {Object} recipient - User document
   * @param {String} messageId - Database message ID
   * @returns {Promise<Object>}
   */
  async sendThankYou(event, recipient, messageId) {
    const body = this.generateThankYouText(event, recipient);
    return await this.send({
      to: recipient.phone,
      body,
      messageId,
    });
  }

  /**
   * Format phone number to E.164 format (required by Twilio)
   * @param {String} phone - Phone number in any format
   * @returns {String} - E.164 formatted phone number
   */
  formatPhoneNumber(phone) {
    // Remove all non-digit characters
    let cleaned = phone.replace(/\D/g, '');
    
    // If it doesn't start with +, assume it's a US number and add +1
    if (!phone.startsWith('+')) {
      if (cleaned.length === 10) {
        cleaned = '+1' + cleaned;
      } else if (cleaned.length === 11 && cleaned.startsWith('1')) {
        cleaned = '+' + cleaned;
      }
    }
    
    return cleaned;
  }

  // Template generators
  generateInvitationText(event, recipient) {
    const date = new Date(event.date).toLocaleDateString();
    const time = event.time ? ` at ${event.time}` : '';
    const location = event.location ? ` at ${event.location}` : '';
    
    return `Hi ${recipient.username}, you're invited to ${event.title} on ${date}${time}${location}. Reply YES to confirm or visit the event page.`;
  }

  generateReminderText(event, recipient) {
    const date = new Date(event.date).toLocaleDateString();
    const time = event.time ? ` at ${event.time}` : '';
    const location = event.location ? ` at ${event.location}` : '';
    
    return `Reminder: ${event.title} is coming up on ${date}${time}${location}. We look forward to seeing you!`;
  }

  generateThankYouText(event, recipient) {
    return `Thank you ${recipient.username} for attending ${event.title}! We hope you enjoyed it. Please share your feedback to help us improve.`;
  }
}

export default SMSService;

