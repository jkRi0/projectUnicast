import { Link } from 'react-router-dom';
import { useAuthContext } from '../context/AuthContext.jsx';

const EventCard = ({ event }) => {
  const { user } = useAuthContext();
  const eventDate = new Date(event.date);
  const isPast = eventDate < new Date();
  const isToday = eventDate.toDateString() === new Date().toDateString();

  const getStatusColor = () => {
    if (event.status === 'cancelled') return '#dc2626';
    if (event.status === 'completed') return '#6b7280';
    if (isPast && event.status !== 'completed') return '#f59e0b';
    if (isToday) return '#10b981';
    return '#2563eb';
  };

  const getStatusText = () => {
    if (event.status === 'cancelled') return 'Cancelled';
    if (event.status === 'completed') return 'Completed';
    if (isPast) return 'Past';
    if (isToday) return 'Today';
    return 'Upcoming';
  };

  return (
    <Link to={`/events/${event._id}`} className="event-card">
      <div className="event-card__header">
        <h3 className="event-card__title">{event.title}</h3>
        <span
          className="event-card__status"
          style={{ backgroundColor: getStatusColor(), color: 'white' }}
        >
          {getStatusText()}
        </span>
      </div>
      
      <div className="event-card__details">
        <div className="event-card__detail">
          <span className="event-card__label">Date:</span>
          <span>{eventDate.toLocaleDateString('en-US', { 
            weekday: 'short', 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
          })}</span>
        </div>
        
        {event.time && (
          <div className="event-card__detail">
            <span className="event-card__label">Time:</span>
            <span>{event.time}</span>
          </div>
        )}
        
        {event.location && (
          <div className="event-card__detail">
            <span className="event-card__label">Location:</span>
            <span>{event.location}</span>
          </div>
        )}
      </div>
      
      {event.description && (
        <p className="event-card__description">{event.description}</p>
      )}
      
      {user && user._id === event.organizer?._id && (
        <div className="event-card__badge">Organizer</div>
      )}
    </Link>
  );
};

export default EventCard;

