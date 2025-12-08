import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useEvents } from '../hooks/useEvents.js';
import EventCard from '../components/EventCard.jsx';
import EventForm from '../components/EventForm.jsx';
import { useAuthContext } from '../context/AuthContext.jsx';

const EventsPage = () => {
  const { user } = useAuthContext();
  const { events, status, error } = useEvents();
  const [filter, setFilter] = useState('all'); // all, upcoming, past

  const filteredEvents = events.filter((event) => {
    const eventDate = new Date(event.date);
    const now = new Date();
    
    if (filter === 'upcoming') return eventDate >= now && event.status !== 'cancelled';
    if (filter === 'past') return eventDate < now || event.status === 'completed';
    return true;
  });

  return (
    <div className="container">
      <div style={{ marginBottom: '2rem' }}>
        <h1>Browse Events</h1>
        <p style={{ color: 'var(--color-muted)', marginTop: '0.5rem' }}>
          Discover and explore public events. {user ? 'Create events from your dashboard.' : 'Sign in to create your own events.'}
        </p>
      </div>

      <div className="filter-tabs" style={{ marginBottom: '1.5rem' }}>
        <button
          className={`filter-tab ${filter === 'all' ? 'filter-tab--active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All Events ({events.length})
        </button>
        <button
          className={`filter-tab ${filter === 'upcoming' ? 'filter-tab--active' : ''}`}
          onClick={() => setFilter('upcoming')}
        >
          Upcoming ({events.filter(e => new Date(e.date) >= new Date() && e.status !== 'cancelled').length})
        </button>
        <button
          className={`filter-tab ${filter === 'past' ? 'filter-tab--active' : ''}`}
          onClick={() => setFilter('past')}
        >
          Past ({events.filter(e => new Date(e.date) < new Date() || e.status === 'completed').length})
        </button>
      </div>

      {error && <div className="alert alert--error">{error}</div>}

      {status === 'loading' && <p>Loading events...</p>}

      {status === 'success' && filteredEvents.length === 0 && (
        <div className="empty-state">
          <p>No events found matching your filter.</p>
          {user && (
            <Link to="/" className="btn">
              Create Event from Dashboard
            </Link>
          )}
        </div>
      )}

      {status === 'success' && filteredEvents.length > 0 && (
        <div className="event-grid">
          {filteredEvents.map((event) => (
            <EventCard key={event._id} event={event} />
          ))}
        </div>
      )}
    </div>
  );
};

export default EventsPage;

