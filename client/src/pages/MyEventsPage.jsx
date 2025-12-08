import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthContext } from '../context/AuthContext.jsx';
import { useEvents } from '../hooks/useEvents.js';
import EventCard from '../components/EventCard.jsx';
import EventForm from '../components/EventForm.jsx';
import Modal from '../components/Modal.jsx';

const MyEventsPage = () => {
  const { user } = useAuthContext();
  const navigate = useNavigate();
  const { events, status, error, createEvent, updateEvent, deleteEvent } = useEvents();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [filter, setFilter] = useState('all'); // all, upcoming, past, draft
  const [selectedEvent, setSelectedEvent] = useState(null);

  if (!user) {
    return (
      <div className="container">
        <div className="alert">
          Please log in to manage your events.
        </div>
        <Link to="/login" className="btn">
          Log In
        </Link>
      </div>
    );
  }

  const myEvents = events.filter((event) => event.organizer?._id === user._id);

  const handleCreateEvent = async (eventData) => {
    const result = await createEvent(eventData);
    if (result.success) {
      setShowCreateForm(false);
      // Navigate to the new event's management page
      navigate(`/my-events/${result.event._id}`);
    }
  };

  const handleDeleteEvent = async (eventId) => {
    if (window.confirm('Are you sure you want to delete this event? This will also delete all RSVPs and feedback. This action cannot be undone.')) {
      await deleteEvent(eventId);
    }
  };

  const filteredEvents = myEvents.filter((event) => {
    const eventDate = new Date(event.date);
    const now = new Date();

    if (filter === 'upcoming') {
      return eventDate >= now && event.status !== 'cancelled';
    }
    if (filter === 'past') {
      return eventDate < now || event.status === 'completed';
    }
    if (filter === 'draft') {
      return event.status === 'draft';
    }
    return true;
  });

  const getEventStats = (event) => {
    // These would come from API in real implementation
    return {
      totalInvites: 0,
      confirmed: 0,
      declined: 0,
      pending: 0,
      messagesSent: 0,
    };
  };

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1>My Events</h1>
          <p style={{ color: 'var(--color-muted)', marginTop: '0.5rem' }}>
            Manage your events, send personalized invitations, and track participant responses
          </p>
        </div>
        <button
          className="btn"
          onClick={() => setShowCreateForm(true)}
        >
          + Create Event
        </button>
      </div>

      <Modal
        isOpen={showCreateForm}
        onClose={() => setShowCreateForm(false)}
        title="Create New Event"
      >
        <EventForm
          onSubmit={handleCreateEvent}
          onCancel={() => setShowCreateForm(false)}
          isSubmitting={status === 'loading'}
        />
      </Modal>

      <div className="filter-tabs" style={{ marginBottom: '1.5rem' }}>
        <button
          className={`filter-tab ${filter === 'all' ? 'filter-tab--active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All ({myEvents.length})
        </button>
        <button
          className={`filter-tab ${filter === 'upcoming' ? 'filter-tab--active' : ''}`}
          onClick={() => setFilter('upcoming')}
        >
          Upcoming ({myEvents.filter(e => new Date(e.date) >= new Date() && e.status !== 'cancelled').length})
        </button>
        <button
          className={`filter-tab ${filter === 'past' ? 'filter-tab--active' : ''}`}
          onClick={() => setFilter('past')}
        >
          Past ({myEvents.filter(e => new Date(e.date) < new Date() || e.status === 'completed').length})
        </button>
        <button
          className={`filter-tab ${filter === 'draft' ? 'filter-tab--active' : ''}`}
          onClick={() => setFilter('draft')}
        >
          Drafts ({myEvents.filter(e => e.status === 'draft').length})
        </button>
      </div>

      {error && <div className="alert alert--error">{error}</div>}

      {status === 'loading' && <p>Loading events...</p>}

      {status === 'success' && filteredEvents.length === 0 && (
        <div className="empty-state">
          <p>
            {filter === 'all'
              ? "You haven't created any events yet."
              : `No ${filter} events found.`}
          </p>
          <button className="btn" onClick={() => setShowCreateForm(true)}>
            Create Your First Event
          </button>
        </div>
      )}

      {status === 'success' && filteredEvents.length > 0 && (
        <div className="event-management-grid">
          {filteredEvents.map((event) => {
            const stats = getEventStats(event);
            const eventDate = new Date(event.date);
            const isUpcoming = eventDate >= new Date();
            
            return (
              <div key={event._id} className="event-management-card">
                <div className="event-management-card__header">
                  <Link to={`/events/${event._id}`} className="event-management-card__title">
                    {event.title}
                  </Link>
                  <div className="event-management-card__actions">
                    <Link
                      to={`/events/${event._id}`}
                      className="btn btn--small btn--outline"
                    >
                      View
                    </Link>
                    <button
                      className="btn btn--small btn--danger"
                      onClick={() => handleDeleteEvent(event._id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>

                <div className="event-management-card__details">
                  <div className="event-detail-item">
                    <span className="event-detail-label">Date:</span>
                    <span>{eventDate.toLocaleDateString('en-US', { 
                      weekday: 'short', 
                      year: 'numeric', 
                      month: 'short', 
                      day: 'numeric' 
                    })}</span>
                  </div>
                  {event.time && (
                    <div className="event-detail-item">
                      <span className="event-detail-label">Time:</span>
                      <span>{event.time}</span>
                    </div>
                  )}
                  {event.location && (
                    <div className="event-detail-item">
                      <span className="event-detail-label">Location:</span>
                      <span>{event.location}</span>
                    </div>
                  )}
                  <div className="event-detail-item">
                    <span className="event-detail-label">Status:</span>
                    <span className={`status-badge status-badge--${event.status}`}>
                      {event.status}
                    </span>
                  </div>
                </div>

                {/* UNICAST Features */}
                <div className="event-management-card__unicast">
                  <h4 style={{ margin: '0 0 0.75rem 0', fontSize: '0.9rem', color: 'var(--color-primary)' }}>
                    Event Management
                  </h4>
                  <div className="unicast-stats">
                    <div className="unicast-stat">
                      <span className="unicast-stat__label">Invitations</span>
                      <span className="unicast-stat__value">{stats.totalInvites}</span>
                    </div>
                    <div className="unicast-stat">
                      <span className="unicast-stat__label">Confirmed</span>
                      <span className="unicast-stat__value unicast-stat__value--success">{stats.confirmed}</span>
                    </div>
                    <div className="unicast-stat">
                      <span className="unicast-stat__label">Pending</span>
                      <span className="unicast-stat__value unicast-stat__value--warning">{stats.pending}</span>
                    </div>
                    <div className="unicast-stat">
                      <span className="unicast-stat__label">Messages</span>
                      <span className="unicast-stat__value">{stats.messagesSent}</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="event-management-card__actions-bottom">
                  <Link
                    to={`/events/${event._id}`}
                    className="btn btn--small"
                  >
                    Manage Event
                  </Link>
                  {isUpcoming && event.requiresRSVP && (
                    <button
                      className="btn btn--small btn--outline"
                      onClick={() => {
                        // TODO: Open send invitations modal
                        alert('Send invitations feature - to be implemented');
                      }}
                    >
                      Send Invitations
                    </button>
                  )}
                  {isUpcoming && (
                    <button
                      className="btn btn--small btn--outline"
                      onClick={() => {
                        // TODO: Open send reminders modal
                        alert('Send reminders feature - to be implemented');
                      }}
                    >
                      Send Reminders
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyEventsPage;
