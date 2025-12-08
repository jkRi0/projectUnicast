# Step-by-Step: Implementing Send Invitations Feature

## Overview
This guide will help you implement the "Send Invitations" feature that uses email (SendGrid) and SMS (Twilio) to send personalized invitations to event participants.

---

## Step 1: Create Backend Message Controller

### 1.1 Create the controller file
Create `server/src/controllers/messageController.js`

This controller will handle:
- Sending invitations via email/SMS
- Sending reminders
- Getting message history

### 1.2 Create the routes file
Create `server/src/routes/messageRoutes.js`

This will define the API endpoints like:
- `POST /api/events/:id/invitations` - Send invitations
- `POST /api/events/:id/reminders` - Send reminders
- `GET /api/events/:id/messages` - Get message history

### 1.3 Register routes in app.js
Add the message routes to your Express app

---

## Step 2: Set Up Environment Variables

### 2.1 Add to server/.env file:
```env
# SendGrid Configuration
SENDGRID_API_KEY=your_sendgrid_api_key_here
SENDGRID_FROM_EMAIL=noreply@yourapp.com
SENDGRID_FROM_NAME=UniEvent

# Twilio Configuration
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=+1234567890
```

### 2.2 Get API Keys:
- **SendGrid**: Sign up at https://sendgrid.com, get API key from Settings → API Keys
- **Twilio**: Sign up at https://twilio.com, get credentials from Console → Account → API Keys

---

## Step 3: Install Required Packages

```bash
cd server
npm install twilio @sendgrid/mail
```

---

## Step 4: Implement Email Service (SendGrid)

Update `server/src/services/emailService.js`:
- Replace the placeholder `sendViaSendGrid()` method with actual SendGrid SDK calls
- Use `@sendgrid/mail` package

---

## Step 5: Implement SMS Service (Twilio)

Update `server/src/services/smsService.js`:
- Replace the placeholder `sendViaTwilio()` method with actual Twilio SDK calls
- Use `twilio` package

---

## Step 6: Create Frontend Components

### 6.1 Create SendInvitationsModal component
- Modal to select recipients
- Choose email or SMS
- Preview message
- Send invitations

### 6.2 Create API hook
- `useInvitations.js` hook to call the backend API

### 6.3 Update MyEventsPage
- Replace alert with actual modal
- Connect to API

---

## Step 7: Test the Integration

1. Test email sending
2. Test SMS sending
3. Verify messages are saved in database
4. Check message status tracking

---

## Next Steps After Implementation

1. Add user management (so you can select recipients)
2. Add message templates
3. Add scheduling (send reminders automatically)
4. Add analytics (track open rates, delivery status)

