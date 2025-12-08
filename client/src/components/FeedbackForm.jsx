import { useState, useEffect } from 'react';
import { useFeedback } from '../hooks/useFeedback.js';

const FeedbackForm = ({ eventId, onSubmit }) => {
  const { submitFeedback, status } = useFeedback(eventId);
  const [formData, setFormData] = useState({
    rating: 0,
    comment: '',
    suggestions: '',
    wouldAttendAgain: null,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleRatingClick = (rating) => {
    setFormData((prev) => ({ ...prev, rating }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await submitFeedback(formData);
    if (result.success && onSubmit) {
      onSubmit(result.feedback);
      // Reset form
      setFormData({
        rating: 0,
        comment: '',
        suggestions: '',
        wouldAttendAgain: null,
      });
    }
  };

  return (
    <form className="form-card" onSubmit={handleSubmit}>
      <h3>Event Feedback</h3>
      <p>Help us improve by sharing your experience</p>

      <div className="form-group">
        <label>Rating *</label>
        <div className="rating-buttons">
          {[1, 2, 3, 4, 5].map((rating) => (
            <button
              key={rating}
              type="button"
              className={`rating-btn ${formData.rating >= rating ? 'rating-btn--active' : ''}`}
              onClick={() => handleRatingClick(rating)}
            >
              ★
            </button>
          ))}
        </div>
        {formData.rating > 0 && (
          <p style={{ marginTop: '0.5rem', color: '#6b7280' }}>
            {formData.rating} out of 5 stars
          </p>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="comment">Comments</label>
        <textarea
          id="comment"
          name="comment"
          value={formData.comment}
          onChange={handleChange}
          rows="4"
          placeholder="Share your thoughts about the event..."
        />
      </div>

      <div className="form-group">
        <label htmlFor="suggestions">Suggestions for Improvement</label>
        <textarea
          id="suggestions"
          name="suggestions"
          value={formData.suggestions}
          onChange={handleChange}
          rows="3"
          placeholder="Any suggestions to make future events better..."
        />
      </div>

      <div className="form-group">
        <label className="checkbox-label">
          <input
            type="checkbox"
            name="wouldAttendAgain"
            checked={formData.wouldAttendAgain === true}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                wouldAttendAgain: e.target.checked,
              }))
            }
          />
          <span>I would attend similar events in the future</span>
        </label>
      </div>

      <div className="form-actions">
        <button
          type="submit"
          className="btn"
          disabled={status === 'loading' || formData.rating === 0}
        >
          {status === 'loading' ? 'Submitting...' : 'Submit Feedback'}
        </button>
      </div>
    </form>
  );
};

export default FeedbackForm;

