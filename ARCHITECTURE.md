# UNICAST System Architecture

## Overview

UNICAST is an event management system that enables personalized (unicast) communication for event planning, RSVP tracking, and participant engagement.

## System Components

### 1. Database Models

#### User Model (`server/src/models/User.js`)
- **Fields**: username, email, password, phone, role, preferences
- **Roles**: admin, teacher, student, parent, user
- **Preferences**: emailNotifications, smsNotifications
- **Authentication**: Supports local and Google OAuth

#### Event Model (`server/src/models/Event.js`)
- **Fields**: title, description, date, time, location, organizer, status
- **Status**: draft, published, cancelled, completed
- **Features**: maxAttendees, requiresRSVP, reminderSent, thankYouSent

#### RSVP Model (`server/src/models/RSVP.js`)
- **Fields**: event, user, status, respondedAt, reminderSent, attended
- **Status**: pending, confirmed, declined, maybe
- **Unique Constraint**: One RSVP per user per event

#### Feedback Model (`server/src/models/Feedback.js`)
- **Fields**: event, user, rating, comment, suggestions, wouldAttendAgain
- **Rating**: 1-5 scale
- **Unique Constraint**: One feedback per user per event

#### Resource Model (`server/src/models/Resource.js`)
- **Fields**: event, name, description, type, assignedTo, status, quantity
- **Types**: equipment, personnel, venue, material, other
- **Status**: available, assigned, in-use, completed

#### Message Model (`server/src/models/Message.js`)
- **Fields**: event, recipient, sender, type, channel, subject, content, status
- **Types**: invitation, reminder, thank-you, update, custom
- **Channels**: email, sms, in-app
- **Status**: pending, sent, delivered, failed

### 2. Messaging Services

#### Base Messaging Service (`server/src/services/messagingService.js`)
- Abstract base class for all messaging services
- Handles message record creation and status updates
- Manages recipient contact information
- Checks user notification preferences

#### Email Service (`server/src/services/emailService.js`)
- Extends MessagingService
- Uses SendGrid API for email delivery
- Template generators for:
  - Event invitations
  - Event reminders
  - Thank you messages
- HTML and plain text email support

#### SMS Service (`server/src/services/smsService.js`)
- Extends MessagingService
- Uses Twilio API for SMS delivery
- Template generators for:
  - Event invitations
  - Event reminders
  - Thank you messages
- Phone number formatting (E.164)

### 3. System Flow

#### Event Creation Flow
1. Admin/Teacher creates event
2. System generates invitations for all participants
3. Messages are queued (email/SMS based on user preferences)
4. Messages are sent via respective services
5. Message status is tracked in database

#### RSVP Flow
1. User receives invitation (email/SMS)
2. User responds via web interface or reply
3. RSVP status is updated
4. Organizer is notified of response
5. Reminder is scheduled if confirmed

#### Reminder Flow
1. Scheduled job checks for upcoming events
2. For each event, finds confirmed RSVPs
3. Sends reminder messages (email/SMS)
4. Updates reminderSent flag

#### Post-Event Flow
1. Event status changes to "completed"
2. System sends thank you messages to attendees
3. Feedback survey is sent
4. Feedback is collected and stored

## API Endpoints (To Be Implemented)

### Events
- `POST /api/events` - Create event
- `GET /api/events` - List events
- `GET /api/events/:id` - Get event details
- `PUT /api/events/:id` - Update event
- `DELETE /api/events/:id` - Delete event

### RSVP
- `POST /api/events/:id/rsvp` - Create/update RSVP
- `GET /api/events/:id/rsvp` - Get RSVP status
- `GET /api/events/:id/rsvps` - List all RSVPs for event

### Feedback
- `POST /api/events/:id/feedback` - Submit feedback
- `GET /api/events/:id/feedback` - Get feedback for event

### Resources
- `POST /api/events/:id/resources` - Add resource
- `GET /api/events/:id/resources` - List resources
- `PUT /api/resources/:id` - Update resource
- `DELETE /api/resources/:id` - Delete resource

### Messages
- `POST /api/messages/send` - Send custom message
- `GET /api/messages` - List messages
- `GET /api/messages/:id` - Get message details

## Environment Variables

### Database
```env
MONGO_URI=mongodb://localhost:27017
MONGO_DB_NAME=unicast_db
```

### Authentication
```env
SESSION_SECRET=your_secret_key
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
ALLOWED_GOOGLE_EMAILS=email1@example.com,email2@example.com
```

### Twilio (SMS)
```env
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1234567890
```

### SendGrid (Email)
```env
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
SENDGRID_FROM_EMAIL=noreply@yourdomain.com
SENDGRID_FROM_NAME=UNICAST System
```

## Next Steps

1. **Implement Controllers**: Create controllers for events, RSVP, feedback, resources
2. **Create Routes**: Set up API routes for all endpoints
3. **Build Frontend**: Create React components for event management
4. **Scheduled Jobs**: Implement cron jobs for reminders and thank you messages
5. **Testing**: Write unit and integration tests
6. **API Integration**: Follow INTEGRATION_GUIDE.md for Twilio and SendGrid setup

## File Structure

```
server/
├── src/
│   ├── models/
│   │   ├── User.js
│   │   ├── Event.js
│   │   ├── RSVP.js
│   │   ├── Feedback.js
│   │   ├── Resource.js
│   │   └── Message.js
│   ├── services/
│   │   ├── messagingService.js
│   │   ├── emailService.js
│   │   └── smsService.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── eventController.js (to be created)
│   │   ├── rsvpController.js (to be created)
│   │   └── feedbackController.js (to be created)
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── eventRoutes.js (to be created)
│   │   └── rsvpRoutes.js (to be created)
│   └── utils/
│       └── scheduler.js (to be created)
```

