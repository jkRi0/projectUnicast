# Step-by-Step: Send Invitations Implementation Guide

## ✅ What's Already Done

1. ✅ Backend API Controller (`server/src/controllers/messageController.js`)
2. ✅ Backend API Routes (`server/src/routes/messageRoutes.js`)
3. ✅ Routes registered in `server/src/app.js`
4. ✅ Email Service structure (`server/src/services/emailService.js`)
5. ✅ SMS Service structure (`server/src/services/smsService.js`)
6. ✅ Message Model (`server/src/models/Message.js`)

---

## 📋 Step-by-Step Implementation

### **STEP 1: Install Required Packages**

```bash
cd server
npm install twilio @sendgrid/mail
```

---

### **STEP 2: Get API Keys**

#### **SendGrid (Email)**
1. Go to https://sendgrid.com
2. Sign up or log in
3. Go to **Settings** → **API Keys**
4. Click **Create API Key**
5. Name it (e.g., "UniEvent Production")
6. Select **Full Access** or **Mail Send** permissions
7. Copy the API key (you'll only see it once!)

#### **Twilio (SMS)**
1. Go to https://twilio.com
2. Sign up or log in (free trial available)
3. Go to **Console** → **Account** → **API Keys & Tokens**
4. Copy your:
   - **Account SID** (starts with `AC...`)
   - **Auth Token**
5. Go to **Phone Numbers** → **Manage** → **Buy a number**
6. Purchase a phone number (free trial includes $15.50 credit)
7. Copy the phone number (e.g., `+1234567890`)

---

### **STEP 3: Add Environment Variables**

Add to `server/.env`:

```env
# SendGrid Configuration
SENDGRID_API_KEY=SG.your_actual_api_key_here
SENDGRID_FROM_EMAIL=noreply@yourapp.com
SENDGRID_FROM_NAME=UniEvent

# Twilio Configuration
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+1234567890
```

**⚠️ Important:** Never commit `.env` to git! It should be in `.gitignore`

---

### **STEP 4: Implement SendGrid Email Service**

Open `server/src/services/emailService.js` and find the `sendViaSendGrid` method (around line 74).

Replace it with:

```javascript
async sendViaSendGrid({ to, subject, text, html }) {
  const sgMail = require('@sendgrid/mail');
  sgMail.setApiKey(this.apiKey);

  const msg = {
    to,
    from: {
      email: this.fromEmail,
      name: this.fromName,
    },
    subject,
    text,
    html: html || text,
  };

  try {
    const response = await sgMail.send(msg);
    return {
      messageId: response[0].headers['x-message-id'],
      statusCode: response[0].statusCode,
    };
  } catch (error) {
    console.error('SendGrid error:', error.response?.body || error.message);
    throw error;
  }
}
```

**Also update the import at the top:**
```javascript
import sgMail from '@sendgrid/mail';
```

---

### **STEP 5: Implement Twilio SMS Service**

Open `server/src/services/smsService.js` and find the `sendViaTwilio` method (around line 70).

Replace it with:

```javascript
async sendViaTwilio({ to, body }) {
  const twilio = require('twilio');
  const client = twilio(this.accountSid, this.authToken);

  try {
    const message = await client.messages.create({
      body,
      from: this.fromNumber,
      to,
    });

    return {
      sid: message.sid,
      status: message.status,
    };
  } catch (error) {
    console.error('Twilio error:', error.message);
    throw error;
  }
}
```

**Also update the import at the top:**
```javascript
import twilio from 'twilio';
```

---

### **STEP 6: Test Backend API**

1. Start your server: `cd server && npm run dev`
2. Test with Postman or curl:

```bash
# Send invitations (replace EVENT_ID and USER_ID)
curl -X POST http://localhost:3000/api/events/EVENT_ID/invitations \
  -H "Content-Type: application/json" \
  -H "Cookie: your_session_cookie" \
  -d '{
    "recipientIds": ["USER_ID"],
    "channels": ["email"]
  }'
```

---

### **STEP 7: Create Frontend Hook**

Create `client/src/hooks/useInvitations.js`:

```javascript
import { useState } from 'react';
import api from '../utils/api.js';

export const useInvitations = (eventId) => {
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState(null);

  const sendInvitations = async (recipientIds, channels) => {
    setStatus('loading');
    setError(null);
    
    try {
      const response = await api.post(`/events/${eventId}/invitations`, {
        recipientIds,
        channels,
      });
      
      setStatus('success');
      return { success: true, data: response.data };
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to send invitations';
      setError(errorMsg);
      setStatus('error');
      return { success: false, error: errorMsg };
    }
  };

  const sendReminders = async (recipientIds, channels) => {
    setStatus('loading');
    setError(null);
    
    try {
      const response = await api.post(`/events/${eventId}/reminders`, {
        recipientIds,
        channels,
      });
      
      setStatus('success');
      return { success: true, data: response.data };
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to send reminders';
      setError(errorMsg);
      setStatus('error');
      return { success: false, error: errorMsg };
    }
  };

  return {
    sendInvitations,
    sendReminders,
    status,
    error,
  };
};
```

---

### **STEP 8: Create Frontend Modal Component**

Create `client/src/components/SendInvitationsModal.jsx` (I'll create this next)

---

### **STEP 9: Connect to MyEventsPage**

Update the "Send Invitations" button to open the modal instead of showing an alert.

---

## 🎯 Next Steps

After completing these steps:
1. ✅ Backend will send real emails via SendGrid
2. ✅ Backend will send real SMS via Twilio
3. ✅ Frontend will have a modal to select recipients
4. ✅ Messages will be tracked in the database

---

## 🧪 Testing Checklist

- [ ] SendGrid API key works (test email sends)
- [ ] Twilio credentials work (test SMS sends)
- [ ] Backend API endpoints respond correctly
- [ ] Frontend modal opens and works
- [ ] Messages are saved in database
- [ ] Error handling works (missing email/phone)

---

## 📝 Notes

- **SendGrid Free Tier**: 100 emails/day
- **Twilio Free Trial**: $15.50 credit (enough for testing)
- **Phone Number Format**: Use E.164 format (+1234567890)
- **Email Format**: Standard email format (user@example.com)

