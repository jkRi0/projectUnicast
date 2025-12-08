import MessagingService from './messagingService.js';

/**
 * Email service using SendGrid
 * This is a placeholder that will be implemented with SendGrid API
 */
class EmailService extends MessagingService {
  constructor() {
    super();
    // SendGrid API key will be loaded from environment variables
    this.apiKey = process.env.SENDGRID_API_KEY;
    this.fromEmail = process.env.SENDGRID_FROM_EMAIL || 'noreply@example.com';
    this.fromName = process.env.SENDGRID_FROM_NAME || 'Unicast System';
  }

  /**
   * Send an email via SendGrid
   * @param {Object} options - Email options
   * @param {String} options.to - Recipient email
   * @param {String} options.subject - Email subject
   * @param {String} options.text - Plain text content
   * @param {String} options.html - HTML content (optional)
   * @param {String} options.messageId - Database message ID for tracking
   * @returns {Promise<Object>} - Result with status and externalId
   */
  async send(options) {
    const { to, subject, text, html, messageId } = options;

    if (!this.apiKey) {
      console.warn('SendGrid API key not configured. Email not sent.');
      if (messageId) {
        await this.updateMessageStatus(messageId, 'failed', null, 'SendGrid API key not configured');
      }
      return { success: false, error: 'Email service not configured' };
    }

    try {
      // TODO: Implement actual SendGrid API call
      // This will be implemented in the integration guide
      const response = await this.sendViaSendGrid({
        to,
        subject,
        text,
        html,
      });

      if (messageId) {
        await this.updateMessageStatus(messageId, 'sent', response.messageId);
      }

      return {
        success: true,
        messageId: response.messageId,
        externalId: response.messageId,
      };
    } catch (error) {
      console.error('Email send error:', error);
      
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
   * Placeholder for SendGrid API implementation
   * This will be implemented in the integration guide
   */
  async sendViaSendGrid({ to, subject, text, html }) {
    // Placeholder - will be implemented with actual SendGrid SDK
    throw new Error('SendGrid integration not yet implemented. See integration guide.');
  }

  /**
   * Send event invitation email
   * @param {Object} event - Event document
   * @param {Object} recipient - User document
   * @param {String} messageId - Database message ID
   * @returns {Promise<Object>}
   */
  async sendInvitation(event, recipient, messageId) {
    const subject = `Invitation: ${event.title}`;
    const text = this.generateInvitationText(event, recipient);
    const html = this.generateInvitationHTML(event, recipient);

    return await this.send({
      to: recipient.email,
      subject,
      text,
      html,
      messageId,
    });
  }

  /**
   * Send event reminder email
   * @param {Object} event - Event document
   * @param {Object} recipient - User document
   * @param {String} messageId - Database message ID
   * @returns {Promise<Object>}
   */
  async sendReminder(event, recipient, messageId) {
    const subject = `Reminder: ${event.title} is coming up`;
    const text = this.generateReminderText(event, recipient);
    const html = this.generateReminderHTML(event, recipient);

    return await this.send({
      to: recipient.email,
      subject,
      text,
      html,
      messageId,
    });
  }

  /**
   * Send thank you email after event
   * @param {Object} event - Event document
   * @param {Object} recipient - User document
   * @param {String} messageId - Database message ID
   * @returns {Promise<Object>}
   */
  async sendThankYou(event, recipient, messageId) {
    const subject = `Thank you for attending: ${event.title}`;
    const text = this.generateThankYouText(event, recipient);
    const html = this.generateThankYouHTML(event, recipient);

    return await this.send({
      to: recipient.email,
      subject,
      text,
      html,
      messageId,
    });
  }

  // Template generators
  generateInvitationText(event, recipient) {
    return `
Hello ${recipient.username},

You are invited to attend: ${event.title}

Date: ${new Date(event.date).toLocaleDateString()}
${event.time ? `Time: ${event.time}` : ''}
${event.location ? `Location: ${event.location}` : ''}

${event.description || ''}

Please confirm your attendance by replying to this email or visiting the event page.

Best regards,
Unicast System
    `.trim();
  }

  generateInvitationHTML(event, recipient) {
    return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #4CAF50; color: white; padding: 20px; text-align: center; }
    .content { padding: 20px; background-color: #f9f9f9; }
    .event-details { background-color: white; padding: 15px; margin: 15px 0; border-left: 4px solid #4CAF50; }
    .button { display: inline-block; padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px; margin-top: 15px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Event Invitation</h1>
    </div>
    <div class="content">
      <p>Hello ${recipient.username},</p>
      <p>You are invited to attend:</p>
      <div class="event-details">
        <h2>${event.title}</h2>
        <p><strong>Date:</strong> ${new Date(event.date).toLocaleDateString()}</p>
        ${event.time ? `<p><strong>Time:</strong> ${event.time}</p>` : ''}
        ${event.location ? `<p><strong>Location:</strong> ${event.location}</p>` : ''}
        ${event.description ? `<p>${event.description}</p>` : ''}
      </div>
      <p>Please confirm your attendance.</p>
      <a href="#" class="button">RSVP Now</a>
    </div>
  </div>
</body>
</html>
    `.trim();
  }

  generateReminderText(event, recipient) {
    return `
Hello ${recipient.username},

This is a reminder that ${event.title} is coming up soon.

Date: ${new Date(event.date).toLocaleDateString()}
${event.time ? `Time: ${event.time}` : ''}
${event.location ? `Location: ${event.location}` : ''}

We look forward to seeing you there!

Best regards,
Unicast System
    `.trim();
  }

  generateReminderHTML(event, recipient) {
    return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #FF9800; color: white; padding: 20px; text-align: center; }
    .content { padding: 20px; background-color: #f9f9f9; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Event Reminder</h1>
    </div>
    <div class="content">
      <p>Hello ${recipient.username},</p>
      <p>This is a reminder that <strong>${event.title}</strong> is coming up soon.</p>
      <p><strong>Date:</strong> ${new Date(event.date).toLocaleDateString()}</p>
      ${event.time ? `<p><strong>Time:</strong> ${event.time}</p>` : ''}
      ${event.location ? `<p><strong>Location:</strong> ${event.location}</p>` : ''}
      <p>We look forward to seeing you there!</p>
    </div>
  </div>
</body>
</html>
    `.trim();
  }

  generateThankYouText(event, recipient) {
    return `
Hello ${recipient.username},

Thank you for attending ${event.title}!

We hope you enjoyed the event. Your participation is greatly appreciated.

Please take a moment to share your feedback to help us improve future events.

Best regards,
Unicast System
    `.trim();
  }

  generateThankYouHTML(event, recipient) {
    return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #2196F3; color: white; padding: 20px; text-align: center; }
    .content { padding: 20px; background-color: #f9f9f9; }
    .button { display: inline-block; padding: 10px 20px; background-color: #2196F3; color: white; text-decoration: none; border-radius: 5px; margin-top: 15px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Thank You!</h1>
    </div>
    <div class="content">
      <p>Hello ${recipient.username},</p>
      <p>Thank you for attending <strong>${event.title}</strong>!</p>
      <p>We hope you enjoyed the event. Your participation is greatly appreciated.</p>
      <p>Please take a moment to share your feedback to help us improve future events.</p>
      <a href="#" class="button">Share Feedback</a>
    </div>
  </div>
</body>
</html>
    `.trim();
  }
}

export default EmailService;

