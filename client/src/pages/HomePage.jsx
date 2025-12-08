import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import InstallPrompt from '../components/InstallPrompt.jsx';
import { useAuthContext } from '../context/AuthContext.jsx';
import { useEvents } from '../hooks/useEvents.js';
import EventCard from '../components/EventCard.jsx';
import EventForm from '../components/EventForm.jsx';
import Modal from '../components/Modal.jsx';

const highlights = [
  {
    title: 'Personalized Invitations',
    description: 'Send one-on-one invitations via email or SMS to each participant.',
  },
  {
    title: 'RSVP Tracking',
    description: 'Track responses and send automated reminders before events.',
  },
  {
    title: 'Feedback Collection',
    description: 'Gather feedback after events to improve future planning.',
  },
];

const HomePage = () => {
  const { user, logout } = useAuthContext();
  const { events, status, createEvent } = useEvents();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [stats, setStats] = useState({
    totalEvents: 0,
    myEvents: 0,
    upcomingEvents: 0,
    confirmedRSVPs: 0,
  });

  useEffect(() => {
    if (status === 'success' && events.length > 0 && user) {
      const myEvents = events.filter((e) => e.organizer?._id === user._id);
      const upcoming = events.filter(
        (e) => new Date(e.date) >= new Date() && e.status !== 'cancelled'
      );

      setStats({
        totalEvents: events.length,
        myEvents: myEvents.length,
        upcomingEvents: upcoming.length,
        confirmedRSVPs: 0, // Would need API call
      });
    }
  }, [events, status, user]);

  const handleCreateEvent = async (eventData) => {
    const result = await createEvent(eventData);
    if (result.success) {
      setShowCreateForm(false);
    }
  };

  // For logged-in users: Dashboard view
  if (user) {
    const myEvents = events.filter((e) => e.organizer?._id === user._id);
    const upcomingEvents = events
      .filter((e) => new Date(e.date) >= new Date() && e.status !== 'cancelled')
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(0, 6);

    const recentEvents = events
      .sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date))
      .slice(0, 3);

    return (
      <div className="container home-page">
        {/* Dashboard Header */}
        <div className="dashboard-header">
          <div>
            <h1>Welcome back, {user.username}!</h1>
            <p style={{ color: 'var(--color-muted)', marginTop: '0.5rem' }}>
              Manage your events and send personalized invitations
            </p>
          </div>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <button
              className="btn"
              onClick={() => setShowCreateForm(true)}
            >
              + Create Event
            </button>
            <InstallPrompt />
          </div>
        </div>

        {/* Create Event Modal */}
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

        {/* Statistics Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-card__content">
              <div className="stat-card__value">{stats.totalEvents}</div>
              <div className="stat-card__label">Total Events</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-card__content">
              <div className="stat-card__value">{stats.myEvents}</div>
              <div className="stat-card__label">My Events</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-card__content">
              <div className="stat-card__value">{stats.upcomingEvents}</div>
              <div className="stat-card__label">Upcoming Events</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-card__content">
              <div className="stat-card__value">{stats.confirmedRSVPs}</div>
              <div className="stat-card__label">Confirmed RSVPs</div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="dashboard-section">
          <h2>Quick Actions</h2>
          <div className="quick-actions">
            <Link to="/my-events" className="quick-action-card">
              <div className="quick-action-card__content">
                <h3>Manage Events</h3>
                <p>View and manage your events, send invitations, and track participants</p>
              </div>
            </Link>

            <Link to="/events" className="quick-action-card">
              <div className="quick-action-card__content">
                <h3>Browse Events</h3>
                <p>Discover and explore public events</p>
              </div>
            </Link>

            <Link to="/my-rsvps" className="quick-action-card">
              <div className="quick-action-card__content">
                <h3>My RSVPs</h3>
                <p>View your event responses and attendance</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Upcoming Events */}
        {upcomingEvents.length > 0 && (
          <div className="dashboard-section">
            <div className="dashboard-section__header">
              <h2>Upcoming Events</h2>
              <Link to="/events" className="btn btn--ghost">
                View All →
              </Link>
            </div>
            <div className="event-grid">
              {upcomingEvents.map((event) => (
                <EventCard key={event._id} event={event} />
              ))}
            </div>
          </div>
        )}

        {/* My Events Preview */}
        {myEvents.length > 0 && (
          <div className="dashboard-section">
            <div className="dashboard-section__header">
              <h2>My Events</h2>
              <Link to="/my-events" className="btn btn--ghost">
                Manage All →
              </Link>
            </div>
            <div className="event-grid">
              {myEvents.slice(0, 3).map((event) => (
                <EventCard key={event._id} event={event} />
              ))}
            </div>
          </div>
        )}

        {status === 'success' && events.length === 0 && (
          <div className="empty-state">
            <h2>Get Started</h2>
            <p>Create your first event and start sending personalized invitations!</p>
            <button className="btn" onClick={() => setShowCreateForm(true)}>
              Create Your First Event
            </button>
          </div>
        )}
      </div>
    );
  }

  // For guests: Landing page
  return (
    <div className="container home-page">
      <section className="hero">
        <div style={{ maxWidth: '640px' }}>
          <h1 className="hero__title">UniEvent</h1>
          <p style={{ fontSize: '1.25rem', color: '#475569', lineHeight: 1.7, fontWeight: 500 }}>
            Personalized event planning with one-on-one invitations. Send individual invites via email or SMS, track RSVPs, and collect feedback.
          </p>
          <div className="hero__cta" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '1.5rem' }}>
            <Link to="/login" className="btn">
              Get Started
            </Link>
            <Link to="/events" className="btn btn--outline">
              Browse Events
            </Link>
            <InstallPrompt />
          </div>
        </div>
      </section>

      <section>
        <h2 style={{ fontSize: '1.75rem', marginBottom: '2rem', color: '#1f2937', textAlign: 'center' }}>
          Why UniEvent?
        </h2>
        <div className="card-grid">
          {highlights.map((item, idx) => {
            const colors = ['#2563eb', '#10b981', '#f59e0b'];
            return (
              <article key={item.title} className="card" style={{ borderLeftColor: colors[idx % 3] }}>
                <h2 className="card__title">{item.title}</h2>
                <p style={{ color: '#64748b', lineHeight: 1.6 }}>{item.description}</p>
              </article>
            );
          })}
        </div>
      </section>

      {status === 'success' && events.length > 0 && (
        <section style={{ marginTop: '3rem' }}>
          <h2 style={{ fontSize: '1.75rem', marginBottom: '1.5rem', color: '#1f2937' }}>Featured Events</h2>
          <div className="event-grid">
            {events
              .filter((e) => new Date(e.date) >= new Date())
              .slice(0, 3)
              .map((event) => (
                <EventCard key={event._id} event={event} />
              ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default HomePage;
