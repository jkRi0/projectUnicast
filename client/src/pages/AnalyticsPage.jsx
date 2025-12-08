import { useState, useEffect } from 'react';
import { useAuthContext } from '../context/AuthContext.jsx';
import { useEvents } from '../hooks/useEvents.js';

const AnalyticsPage = () => {
  const { user } = useAuthContext();
  const { events, status } = useEvents();
  const [analytics, setAnalytics] = useState({
    totalEvents: 0,
    totalAttendees: 0,
    averageRating: 0,
    eventStatusBreakdown: {},
    upcomingVsPast: { upcoming: 0, past: 0 },
  });

  useEffect(() => {
    if (status === 'success' && events.length > 0) {
      calculateAnalytics();
    }
  }, [events, status]);

  const calculateAnalytics = () => {
    const now = new Date();
    
    const myEvents = events.filter(
      (event) => event.organizer?._id === user?._id
    );

    const statusBreakdown = {
      draft: 0,
      published: 0,
      cancelled: 0,
      completed: 0,
    };

    let upcoming = 0;
    let past = 0;

    myEvents.forEach((event) => {
      if (event.status) {
        statusBreakdown[event.status] = (statusBreakdown[event.status] || 0) + 1;
      }
      
      const eventDate = new Date(event.date);
      if (eventDate >= now && event.status !== 'cancelled') {
        upcoming++;
      } else {
        past++;
      }
    });

    setAnalytics({
      totalEvents: myEvents.length,
      totalAttendees: 0, // Would need API call to get actual attendee count
      averageRating: 0, // Would need API call to get feedback ratings
      eventStatusBreakdown: statusBreakdown,
      upcomingVsPast: { upcoming, past },
    });
  };

  if (!user) {
    return (
      <div className="container">
        <div className="alert">
          Please log in to view analytics.
        </div>
      </div>
    );
  }

  const myEvents = events.filter(
    (event) => event.organizer?._id === user._id
  );

  if (myEvents.length === 0) {
    return (
      <div className="container">
        <h1>Analytics</h1>
        <div className="empty-state">
          <p>No events to analyze yet. Create some events to see analytics!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div style={{ marginBottom: '2rem' }}>
        <h1>Analytics</h1>
        <p style={{ color: 'var(--color-muted)', marginTop: '0.5rem' }}>
          Insights into your events and their performance
        </p>
      </div>

      {/* Key Metrics */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card__content">
            <div className="stat-card__value">{analytics.totalEvents}</div>
            <div className="stat-card__label">Total Events</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card__content">
            <div className="stat-card__value">{analytics.totalAttendees}</div>
            <div className="stat-card__label">Total Attendees</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card__content">
            <div className="stat-card__value">
              {analytics.averageRating > 0
                ? analytics.averageRating.toFixed(1)
                : 'N/A'}
            </div>
            <div className="stat-card__label">Average Rating</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card__content">
            <div className="stat-card__value">
              {analytics.upcomingVsPast.upcoming}
            </div>
            <div className="stat-card__label">Upcoming Events</div>
          </div>
        </div>
      </div>

      {/* Event Status Breakdown */}
      <div className="dashboard-section">
        <h2>Event Status Breakdown</h2>
        <div className="analytics-chart">
          <div className="chart-item">
            <div className="chart-item__label">Published</div>
            <div className="chart-item__bar">
              <div
                className="chart-item__fill"
                style={{
                  width: `${
                    (analytics.eventStatusBreakdown.published /
                      analytics.totalEvents) *
                    100
                  }%`,
                  background: '#10b981',
                }}
              >
                {analytics.eventStatusBreakdown.published}
              </div>
            </div>
          </div>

          <div className="chart-item">
            <div className="chart-item__label">Draft</div>
            <div className="chart-item__bar">
              <div
                className="chart-item__fill"
                style={{
                  width: `${
                    (analytics.eventStatusBreakdown.draft /
                      analytics.totalEvents) *
                    100
                  }%`,
                  background: '#6b7280',
                }}
              >
                {analytics.eventStatusBreakdown.draft}
              </div>
            </div>
          </div>

          <div className="chart-item">
            <div className="chart-item__label">Completed</div>
            <div className="chart-item__bar">
              <div
                className="chart-item__fill"
                style={{
                  width: `${
                    (analytics.eventStatusBreakdown.completed /
                      analytics.totalEvents) *
                    100
                  }%`,
                  background: '#2563eb',
                }}
              >
                {analytics.eventStatusBreakdown.completed}
              </div>
            </div>
          </div>

          <div className="chart-item">
            <div className="chart-item__label">Cancelled</div>
            <div className="chart-item__bar">
              <div
                className="chart-item__fill"
                style={{
                  width: `${
                    (analytics.eventStatusBreakdown.cancelled /
                      analytics.totalEvents) *
                    100
                  }%`,
                  background: '#dc2626',
                }}
              >
                {analytics.eventStatusBreakdown.cancelled}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Upcoming vs Past */}
      <div className="dashboard-section">
        <h2>Event Timeline</h2>
        <div className="timeline-chart">
          <div className="timeline-item">
            <div className="timeline-item__label">Upcoming</div>
            <div className="timeline-item__value">
              {analytics.upcomingVsPast.upcoming}
            </div>
            <div
              className="timeline-item__bar"
              style={{
                width: `${
                  (analytics.upcomingVsPast.upcoming /
                    (analytics.upcomingVsPast.upcoming +
                      analytics.upcomingVsPast.past)) *
                  100
                }%`,
                background: '#10b981',
              }}
            />
          </div>
          <div className="timeline-item">
            <div className="timeline-item__label">Past</div>
            <div className="timeline-item__value">
              {analytics.upcomingVsPast.past}
            </div>
            <div
              className="timeline-item__bar"
              style={{
                width: `${
                  (analytics.upcomingVsPast.past /
                    (analytics.upcomingVsPast.upcoming +
                      analytics.upcomingVsPast.past)) *
                  100
                }%`,
                background: '#6b7280',
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;

