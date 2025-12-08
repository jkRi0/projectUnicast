# Alternative Email Setup for Development

If you can't access SendGrid, here are alternatives:

## Option 1: Use Gmail SMTP (Easiest for Testing)

### Setup:
1. Enable 2-Factor Authentication on your Gmail account
2. Generate an App Password:
   - Go to Google Account → Security → 2-Step Verification → App passwords
   - Generate password for "Mail"
   - Copy the 16-character password

### Update emailService.js:

Instead of SendGrid, use Nodemailer with Gmail:

```bash
cd server
npm install nodemailer
```

Then update `server/src/services/emailService.js`:

```javascript
import nodemailer from 'nodemailer';

// In constructor, replace SendGrid setup:
this.transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER, // Your Gmail address
    pass: process.env.GMAIL_APP_PASSWORD, // The 16-char app password
  },
});

// Replace sendViaSendGrid method:
async sendViaSendGrid({ to, subject, text, html }) {
  const mailOptions = {
    from: `"${this.fromName}" <${this.fromEmail}>`,
    to,
    subject,
    text,
    html: html || text,
  };

  try {
    const info = await this.transporter.sendMail(mailOptions);
    return {
      messageId: info.messageId,
      statusCode: 200,
    };
  } catch (error) {
    console.error('Email send error:', error);
    throw error;
  }
}
```

### Add to .env:
```env
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your-16-char-app-password
```

---

## Option 2: Create New SendGrid Account

1. Use a different email address
2. Sign up at https://signup.sendgrid.com
3. Verify your email
4. Get API key from Settings → API Keys

---

## Option 3: Use Mailtrap (Testing Only)

Mailtrap is for testing - emails don't actually send, they're caught in a test inbox.

1. Sign up at https://mailtrap.io (free)
2. Get SMTP credentials
3. Use Nodemailer with Mailtrap SMTP

---

## Option 4: Use Resend (Modern Alternative)

Resend is a modern email API similar to SendGrid.

1. Sign up at https://resend.com
2. Get API key
3. Install: `npm install resend`
4. Update emailService.js to use Resend SDK

---

## Recommendation

For **development/testing**: Use **Gmail SMTP** (Option 1) - it's free and works immediately.

For **production**: Fix SendGrid access or use Resend.

