import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useEvents } from '../hooks/useEvents.js';
import { useRSVP } from '../hooks/useRSVP.js';
import { useFeedback } from '../hooks/useFeedback.js';
import { useAuthContext } from '../context/AuthContext.jsx';
import EventForm from '../components/EventForm.jsx';
import RSVPButton from '../components/RSVPButton.jsx';
import FeedbackForm from '../components/FeedbackForm.jsx';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';

const EventDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const { getEvent, updateEvent, deleteEvent } = useEvents();
  const rsvpHook = useRSVP(id);
  const feedbackHook = useFeedback(id);
  
  const [event, setEvent] = useState(null);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);

  useEffect(() => {
    loadEvent();
    if (user && id) {
      rsvpHook.fetchRSVP();
      feedbackHook.fetchFeedback();
    }
  }, [id, user]);

  // Update document title when event loads
  useEffect(() => {
    if (event) {
      document.title = `${event.title} - UniEvent`;
    }
  }, [event]);

  const loadEvent = async () => {
    setStatus('loading');
    const result = await getEvent(id);
    if (result.success) {
      setEvent(result.event);
      setStatus('success');
    } else {
      setError(result.error);
      setStatus('error');
    }
  };

  const handleUpdateEvent = async (eventData) => {
    const result = await updateEvent(id, eventData);
    if (result.success) {
      setEvent(result.event);
      setShowEditForm(false);
    }
  };

  const handleDeleteEvent = async () => {
    if (window.confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
      const result = await deleteEvent(id);
      if (result.success) {
        navigate('/events');
      }
    }
  };

  const handleRSVPUpdate = (updatedRSVP) => {
    // RSVP updated, reload event to get updated RSVP count
    loadEvent();
  };

  const handleFeedbackSubmit = (submittedFeedback) => {
    setShowFeedbackForm(false);
    // Reload feedback
    feedbackHook.fetchFeedback();
  };

  if (status === 'loading') {
    return (
      <div className="container">
        <p>Loading event...</p>
      </div>
    );
  }

  if (status === 'error' || !event) {
    return (
      <div className="container">
        <div className="alert alert--error">{error || 'Event not found'}</div>
        <Link to="/events" className="btn">Back to Events</Link>
      </div>
    );
  }

  const eventDate = new Date(event.date);
  const isPast = eventDate < new Date();
  const isOrganizer = user && event.organizer?._id === user._id;

  return (
    <div className="container">
      <Link to="/events" className="btn btn--ghost" style={{ marginBottom: '1rem' }}>
        ← Back to Events
      </Link>

      {showEditForm && isOrganizer ? (
        <EventForm
          event={event}
          onSubmit={handleUpdateEvent}
          onCancel={() => setShowEditForm(false)}
          isSubmitting={status === 'loading'}
        />
      ) : (
        <>
          <div className="event-details">
            <div className="event-details__header">
              <h1>{event.title}</h1>
              {isOrganizer && (
                <div className="event-details__actions">
                  <button
                    className="btn btn--outline"
                    onClick={() => setShowEditForm(true)}
                  >
                    Edit
                  </button>
                  <button
                    className="btn btn--danger"
                    onClick={handleDeleteEvent}
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>

            <div className="event-details__info">
              <div className="event-details__item">
                <strong>Date:</strong> {eventDate.toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </div>
              
              {event.time && (
                <div className="event-details__item">
                  <strong>Time:</strong> {event.time}
                </div>
              )}
              
              {event.location && (
                <div className="event-details__item">
                  <strong>Location:</strong> {event.location}
                </div>
              )}
              
              {event.maxAttendees && (
                <div className="event-details__item">
                  <strong>Max Attendees:</strong> {event.maxAttendees}
                </div>
              )}
              
              <div className="event-details__item">
                <strong>Status:</strong> {event.status}
              </div>
            </div>

            {event.description && (
              <div className="event-details__description">
                <h3>Description</h3>
                <p>{event.description}</p>
              </div>
            )}

            {user && event.requiresRSVP && !isPast && (
              <div className="event-details__rsvp">
                <RSVPButton
                  eventId={id}
                  currentRSVP={rsvpHook.rsvp}
                  onRSVPUpdate={handleRSVPUpdate}
                />
              </div>
            )}

            {user && isPast && !feedbackHook.feedback && (
              <div className="event-details__feedback">
                {!showFeedbackForm ? (
                  <button
                    className="btn"
                    onClick={() => setShowFeedbackForm(true)}
                  >
                    Share Feedback
                  </button>
                ) : (
                  <FeedbackForm
                    eventId={id}
                    onSubmit={handleFeedbackSubmit}
                  />
                )}
              </div>
            )}

            {feedbackHook.feedback && (
              <div className="event-details__feedback-display">
                <h3>Your Feedback</h3>
                <div className="feedback-display">
                  <div>
                    <strong>Rating:</strong> {'★'.repeat(feedbackHook.feedback.rating)} ({feedbackHook.feedback.rating}/5)
                  </div>
                  {feedbackHook.feedback.comment && (
                    <div>
                      <strong>Comment:</strong> {feedbackHook.feedback.comment}
                    </div>
                  )}
                  {feedbackHook.feedback.wouldAttendAgain !== null && (
                    <div>
                      <strong>Would attend again:</strong> {feedbackHook.feedback.wouldAttendAgain ? 'Yes' : 'No'}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default EventDetailsPage;

