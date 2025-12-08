import { useState, useEffect } from 'react';

const EventForm = ({ event, onSubmit, onCancel, isSubmitting }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    maxAttendees: '',
    requiresRSVP: true,
  });

  useEffect(() => {
    if (event) {
      const eventDate = new Date(event.date);
      setFormData({
        title: event.title || '',
        description: event.description || '',
        date: eventDate.toISOString().split('T')[0],
        time: event.time || '',
        location: event.location || '',
        maxAttendees: event.maxAttendees || '',
        requiresRSVP: event.requiresRSVP !== false,
      });
    }
  }, [event]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const submitData = {
      ...formData,
      maxAttendees: formData.maxAttendees ? parseInt(formData.maxAttendees) : undefined,
    };
    
    onSubmit(submitData);
  };

  return (
    <form className="form-card" onSubmit={handleSubmit}>
      <h2>{event ? 'Edit Event' : 'Create New Event'}</h2>
      
      <div className="form-group">
        <label htmlFor="title">Event Title *</label>
        <input
          id="title"
          name="title"
          type="text"
          value={formData.title}
          onChange={handleChange}
          required
          placeholder="Enter event title"
        />
      </div>

      <div className="form-group">
        <label htmlFor="description">Description</label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows="4"
          placeholder="Enter event description"
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="date">Date *</label>
          <input
            id="date"
            name="date"
            type="date"
            value={formData.date}
            onChange={handleChange}
            required
            min={new Date().toISOString().split('T')[0]}
          />
        </div>

        <div className="form-group">
          <label htmlFor="time">Time</label>
          <input
            id="time"
            name="time"
            type="time"
            value={formData.time}
            onChange={handleChange}
          />
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="location">Location</label>
        <input
          id="location"
          name="location"
          type="text"
          value={formData.location}
          onChange={handleChange}
          placeholder="Enter event location"
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="maxAttendees">Max Attendees</label>
          <input
            id="maxAttendees"
            name="maxAttendees"
            type="number"
            value={formData.maxAttendees}
            onChange={handleChange}
            min="1"
            placeholder="Optional"
          />
        </div>

        <div className="form-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              name="requiresRSVP"
              checked={formData.requiresRSVP}
              onChange={handleChange}
            />
            <span>Requires RSVP</span>
          </label>
        </div>
      </div>

      <div className="form-actions">
        <button
          type="button"
          className="btn btn--ghost"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="btn"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Saving...' : event ? 'Update Event' : 'Create Event'}
        </button>
      </div>
    </form>
  );
};

export default EventForm;

