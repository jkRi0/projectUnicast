import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuthContext } from '../context/AuthContext.jsx';
import { useEvents } from '../hooks/useEvents.js';
import { useRSVP } from '../hooks/useRSVP.js';
import EventCard from '../components/EventCard.jsx';

const MyRSVPsPage = () => {
  const { user } = useAuthContext();
  const { events, status } = useEvents();
  const [myRSVPs, setMyRSVPs] = useState([]);
  const [filter, setFilter] = useState('all'); // all, confirmed, pending, declined

  useEffect(() => {
    if (user && events.length > 0) {
      // This would ideally come from an API endpoint that returns user's RSVPs
      // For now, we'll need to fetch RSVP for each event
      // In a real implementation, you'd have a /api/users/me/rsvps endpoint
      loadMyRSVPs();
    }
  }, [user, events]);

  const loadMyRSVPs = async () => {
    // This is a placeholder - in real implementation, use an API endpoint
    // For now, we'll show events that require RSVP
    const eventsWithRSVP = events.filter((event) => event.requiresRSVP);
    setMyRSVPs(eventsWithRSVP);
  };

  if (!user) {
    return (
      <div className="container">
        <div className="alert">
          Please log in to view your RSVPs.
        </div>
        <Link to="/login" className="btn">
          Log In
        </Link>
      </div>
    );
  }

  const filteredRSVPs = myRSVPs.filter((rsvp) => {
    if (filter === 'confirmed') return rsvp.rsvpStatus === 'confirmed';
    if (filter === 'pending') return !rsvp.rsvpStatus || rsvp.rsvpStatus === 'pending';
    if (filter === 'declined') return rsvp.rsvpStatus === 'declined';
    return true;
  });

  const getRSVPStatusBadge = (rsvp) => {
    if (!rsvp.rsvpStatus || rsvp.rsvpStatus === 'pending') {
      return <span className="rsvp-badge rsvp-badge--pending">Pending</span>;
    }
    if (rsvp.rsvpStatus === 'confirmed') {
      return <span className="rsvp-badge rsvp-badge--confirmed">Confirmed</span>;
    }
    if (rsvp.rsvpStatus === 'declined') {
      return <span className="rsvp-badge rsvp-badge--declined">Declined</span>;
    }
    if (rsvp.rsvpStatus === 'maybe') {
      return <span className="rsvp-badge rsvp-badge--maybe">Maybe</span>;
    }
    return null;
  };

  return (
    <div className="container">
      <div style={{ marginBottom: '2rem' }}>
        <h1>My RSVPs</h1>
        <p style={{ color: 'var(--color-muted)', marginTop: '0.5rem' }}>
          Events you've been invited to and your responses
        </p>
      </div>

      <div className="filter-tabs" style={{ marginBottom: '1.5rem' }}>
        <button
          className={`filter-tab ${filter === 'all' ? 'filter-tab--active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All
        </button>
        <button
          className={`filter-tab ${filter === 'confirmed' ? 'filter-tab--active' : ''}`}
          onClick={() => setFilter('confirmed')}
        >
          Confirmed
        </button>
        <button
          className={`filter-tab ${filter === 'pending' ? 'filter-tab--active' : ''}`}
          onClick={() => setFilter('pending')}
        >
          Pending
        </button>
        <button
          className={`filter-tab ${filter === 'declined' ? 'filter-tab--active' : ''}`}
          onClick={() => setFilter('declined')}
        >
          Declined
        </button>
      </div>

      {status === 'loading' && <p>Loading RSVPs...</p>}

      {status === 'success' && filteredRSVPs.length === 0 && (
        <div className="empty-state">
          <p>No RSVPs found.</p>
          <Link to="/events" className="btn">
            Browse Events
          </Link>
        </div>
      )}

      {status === 'success' && filteredRSVPs.length > 0 && (
        <div className="rsvp-list">
          {filteredRSVPs.map((rsvp) => (
            <div key={rsvp._id || rsvp.event?._id} className="rsvp-item">
              <div className="rsvp-item__event">
                <EventCard event={rsvp.event || rsvp} />
              </div>
              <div className="rsvp-item__status">
                {getRSVPStatusBadge(rsvp)}
                <Link
                  to={`/events/${rsvp.event?._id || rsvp._id}`}
                  className="btn btn--outline"
                >
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyRSVPsPage;

