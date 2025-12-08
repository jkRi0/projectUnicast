# UNICAST System - API Integration Guide

This guide provides step-by-step instructions for integrating SMS (Twilio) and Email (SendGrid) services into the UNICAST event management system.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Twilio SMS Integration](#twilio-sms-integration)
3. [SendGrid Email Integration](#sendgrid-email-integration)
4. [Testing the Integrations](#testing-the-integrations)
5. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before starting, ensure you have:
- Node.js and npm installed
- Access to the UNICAST server codebase
- Accounts created for:
  - [Twilio](https://www.twilio.com/try-twilio) (free trial available)
  - [SendGrid](https://signup.sendgrid.com/) (free tier available)

---

## Twilio SMS Integration

### Step 1: Install Twilio SDK

Navigate to your server directory and install the Twilio package:

```bash
cd server
npm install twilio
```

### Step 2: Get Twilio Credentials

1. Sign up or log in to [Twilio Console](https://console.twilio.com/)
2. Navigate to **Account** → **API Keys & Tokens**
3. Copy your:
   - **Account SID** (starts with `AC...`)
   - **Auth Token**
4. Get a phone number:
   - Go to **Phone Numbers** → **Manage** → **Buy a number**
   - Select a number and purchase (free trial includes $15.50 credit)
   - Copy the phone number (e.g., `+1234567890`)

### Step 3: Add Environment Variables

Add these to your `.env` file in the server directory:

```env
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+1234567890
```

### Step 4: Implement Twilio Service

Update `server/src/services/smsService.js`:

```javascript
import twilio from 'twilio';
import MessagingService from './messagingService.js';

class SMSService extends MessagingService {
  constructor() {
    super();
    this.accountSid = process.env.TWILIO_ACCOUNT_SID;
    this.authToken = process.env.TWILIO_AUTH_TOKEN;
    this.fromNumber = process.env.TWILIO_PHONE_NUMBER;
    
    // Initialize Twilio client
    this.client = twilio(this.accountSid, this.authToken);
  }

  /**
   * Send SMS via Twilio
   */
  async sendViaTwilio({ to, body }) {
    try {
      const message = await this.client.messages.create({
        body: body,
        from: this.fromNumber,
        to: this.formatPhoneNumber(to), // Ensure E.164 format
      });

      return {
        sid: message.sid,
        status: message.status,
        dateCreated: message.dateCreated,
      };
    } catch (error) {
      console.error('Twilio API Error:', error);
      throw new Error(`Failed to send SMS: ${error.message}`);
    }
  }

  /**
   * Format phone number to E.164 format
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
      } else {
        throw new Error('Invalid phone number format');
      }
    } else {
      cleaned = phone;
    }
    
    return cleaned;
  }
}

export default SMSService;
```

### Step 5: Test SMS Sending

Create a test script `server/test-sms.js`:

```javascript
import dotenv from 'dotenv';
import SMSService from './src/services/smsService.js';

dotenv.config();

const smsService = new SMSService();

async function testSMS() {
  try {
    const result = await smsService.send({
      to: '+1234567890', // Replace with your phone number
      body: 'Test message from UNICAST system',
    });
    
    console.log('SMS sent successfully:', result);
  } catch (error) {
    console.error('Error sending SMS:', error);
  }
}

testSMS();
```

Run the test:
```bash
node test-sms.js
```

---

## SendGrid Email Integration

### Step 1: Install SendGrid SDK

```bash
cd server
npm install @sendgrid/mail
```

### Step 2: Get SendGrid API Key

1. Sign up or log in to [SendGrid](https://app.sendgrid.com/)
2. Navigate to **Settings** → **API Keys**
3. Click **Create API Key**
4. Name it (e.g., "UNICAST System")
5. Select **Full Access** or **Restricted Access** (with Mail Send permissions)
6. Click **Create & View**
7. **Copy the API key immediately** (you won't see it again!)

### Step 3: Verify Sender Identity

1. Go to **Settings** → **Sender Authentication**
2. Choose one:
   - **Single Sender Verification** (for testing):
     - Click **Verify a Single Sender**
     - Fill in the form with your email
     - Verify via email
   - **Domain Authentication** (for production):
     - Click **Authenticate Your Domain**
     - Follow DNS setup instructions

### Step 4: Add Environment Variables

Add these to your `.env` file:

```env
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
SENDGRID_FROM_EMAIL=noreply@yourdomain.com
SENDGRID_FROM_NAME=UNICAST System
```

### Step 5: Implement SendGrid Service

Update `server/src/services/emailService.js`:

```javascript
import sgMail from '@sendgrid/mail';
import MessagingService from './messagingService.js';

class EmailService extends MessagingService {
  constructor() {
    super();
    this.apiKey = process.env.SENDGRID_API_KEY;
    this.fromEmail = process.env.SENDGRID_FROM_EMAIL || 'noreply@example.com';
    this.fromName = process.env.SENDGRID_FROM_NAME || 'UNICAST System';
    
    // Initialize SendGrid
    if (this.apiKey) {
      sgMail.setApiKey(this.apiKey);
    }
  }

  /**
   * Send email via SendGrid
   */
  async sendViaSendGrid({ to, subject, text, html }) {
    try {
      const msg = {
        to: to,
        from: {
          email: this.fromEmail,
          name: this.fromName,
        },
        subject: subject,
        text: text,
        html: html || text, // Use text as fallback if no HTML
      };

      const response = await sgMail.send(msg);
      
      return {
        messageId: response[0].headers['x-message-id'],
        statusCode: response[0].statusCode,
      };
    } catch (error) {
      console.error('SendGrid API Error:', error);
      
      if (error.response) {
        console.error('SendGrid Error Details:', error.response.body);
      }
      
      throw new Error(`Failed to send email: ${error.message}`);
    }
  }
}

export default EmailService;
```

### Step 6: Test Email Sending

Create a test script `server/test-email.js`:

```javascript
import dotenv from 'dotenv';
import EmailService from './src/services/emailService.js';

dotenv.config();

const emailService = new EmailService();

async function testEmail() {
  try {
    const result = await emailService.send({
      to: 'your-email@example.com', // Replace with your email
      subject: 'Test Email from UNICAST',
      text: 'This is a test email from the UNICAST system.',
      html: '<h1>Test Email</h1><p>This is a test email from the UNICAST system.</p>',
    });
    
    console.log('Email sent successfully:', result);
  } catch (error) {
    console.error('Error sending email:', error);
  }
}

testEmail();
```

Run the test:
```bash
node test-email.js
```

---

## Testing the Integrations

### Test SMS Integration

1. Ensure your `.env` has Twilio credentials
2. Run the SMS test script
3. Check your phone for the message
4. Verify the message appears in Twilio Console → **Messaging** → **Logs**

### Test Email Integration

1. Ensure your `.env` has SendGrid API key
2. Run the email test script
3. Check your email inbox (and spam folder)
4. Verify the email appears in SendGrid Dashboard → **Activity**

### Test Full Flow

1. Create an event via the API
2. Add a user with phone/email
3. Trigger an invitation
4. Verify message is sent and recorded in database

---

## Troubleshooting

### Twilio Issues

**Error: "The number +1234567890 is not a valid phone number"**
- Ensure phone numbers are in E.164 format: `+[country code][number]`
- Example: `+1234567890` (US), `+441234567890` (UK)

**Error: "Authenticate"**
- Verify your Account SID and Auth Token are correct
- Check that your Twilio account is active

**Error: "Insufficient funds"**
- Free trial accounts have limited credits
- Check your balance in Twilio Console

### SendGrid Issues

**Error: "The from email does not match a verified Sender Identity"**
- Verify your sender email in SendGrid
- For production, set up domain authentication

**Error: "API key is invalid"**
- Regenerate your API key in SendGrid
- Ensure the key has "Mail Send" permissions

**Emails going to spam**
- Set up SPF, DKIM, and DMARC records
- Use domain authentication instead of single sender
- Avoid spam trigger words in subject/content

### General Issues

**Environment variables not loading**
- Ensure `.env` file is in the server root directory
- Restart your server after adding environment variables
- Use `dotenv` package to load variables

**Messages not being sent**
- Check server logs for error messages
- Verify API credentials are correct
- Test with the standalone test scripts first

---

## Next Steps

After successful integration:

1. **Set up scheduled reminders**: Use a cron job or scheduler to send reminders before events
2. **Implement webhooks**: Set up Twilio/SendGrid webhooks to track delivery status
3. **Add retry logic**: Implement retry mechanism for failed messages
4. **Monitor usage**: Track API usage to stay within free tier limits
5. **Add templates**: Create reusable email/SMS templates for different event types

---

## Security Best Practices

1. **Never commit API keys to version control**
   - Use `.env` files (already in `.gitignore`)
   - Use environment variables in production

2. **Rotate API keys regularly**
   - Change keys every 90 days
   - Revoke old keys immediately

3. **Limit API key permissions**
   - Use restricted access keys when possible
   - Grant only necessary permissions

4. **Monitor usage**
   - Set up alerts for unusual activity
   - Track costs and usage limits

5. **Validate phone numbers and emails**
   - Verify format before sending
   - Handle invalid addresses gracefully

---

## Support Resources

- [Twilio Documentation](https://www.twilio.com/docs)
- [SendGrid Documentation](https://docs.sendgrid.com/)
- [Twilio Support](https://support.twilio.com/)
- [SendGrid Support](https://support.sendgrid.com/)

