# Quick Email Setup - Use Gmail Instead of SendGrid

Since you can't access SendGrid, here's how to use Gmail SMTP for development:

## Step 1: Enable Gmail App Password

1. Go to your Google Account: https://myaccount.google.com
2. Click **Security** (left sidebar)
3. Enable **2-Step Verification** (if not already enabled)
4. Scroll down to **App passwords**
5. Select **Mail** and **Other (Custom name)**
6. Name it "UniEvent" or "Node.js App"
7. Click **Generate**
8. **Copy the 16-character password** (you'll need this!)

## Step 2: Install Nodemailer

```bash
cd server
npm install nodemailer
```

## Step 3: Update emailService.js

Replace the SendGrid implementation with Gmail SMTP. I'll show you the exact code to use.

## Step 4: Update .env

```env
# Gmail Configuration (instead of SendGrid)
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your-16-char-app-password-here
GMAIL_FROM_NAME=UniEvent
```

## Benefits:
- ✅ Free
- ✅ Works immediately
- ✅ No account access issues
- ✅ Perfect for development/testing
- ✅ Can send up to 500 emails/day (Gmail limit)

## Limitations:
- ⚠️ Not ideal for production (use SendGrid/Resend for production)
- ⚠️ Daily sending limits
- ⚠️ "Sent via Gmail" may appear in some clients

