# Step-by-Step: Send Invitations Implementation

## Current Status
✅ Backend services exist (emailService.js, smsService.js) but need API implementation
✅ Message model exists
❌ Backend API endpoints missing
❌ Frontend modal missing
❌ Frontend API integration missing

---

## Step 1: Install Required Packages

```bash
cd server
npm install twilio @sendgrid/mail
```

---

## Step 2: Set Up Environment Variables

Add to `server/.env`:

```env
# SendGrid
SENDGRID_API_KEY=your_api_key_here
SENDGRID_FROM_EMAIL=noreply@yourapp.com
SENDGRID_FROM_NAME=UniEvent

# Twilio
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1234567890
```

**Get API Keys:**
- SendGrid: https://sendgrid.com → Settings → API Keys
- Twilio: https://twilio.com → Console → Account → API Keys

---

## Step 3: Implement Backend API

### 3.1 Create Message Controller
File: `server/src/controllers/messageController.js`
- Handles sending invitations
- Handles sending reminders
- Returns message status

### 3.2 Create Message Routes
File: `server/src/routes/messageRoutes.js`
- `POST /api/events/:id/invitations` - Send invitations
- `POST /api/events/:id/reminders` - Send reminders
- `GET /api/events/:id/messages` - Get message history

### 3.3 Register Routes
Add to `server/src/app.js`

---

## Step 4: Complete Email/SMS Service Implementation

### 4.1 Update emailService.js
Replace placeholder with actual SendGrid SDK calls

### 4.2 Update smsService.js
Replace placeholder with actual Twilio SDK calls

---

## Step 5: Create Frontend Components

### 5.1 Create SendInvitationsModal
- Select recipients (users with email/phone)
- Choose channel (Email, SMS, or Both)
- Preview message
- Send button

### 5.2 Create useInvitations Hook
- API calls to backend
- Handle loading/error states

### 5.3 Update MyEventsPage
- Replace alert with modal
- Connect to API

---

## Step 6: Test

1. Test email sending
2. Test SMS sending
3. Verify database records
4. Check error handling

---

## Implementation Order

1. ✅ Backend API (controller + routes)
2. ✅ Complete email/SMS services
3. ✅ Frontend modal
4. ✅ Connect everything
5. ✅ Test

