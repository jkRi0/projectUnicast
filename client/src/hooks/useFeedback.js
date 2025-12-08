import { useState, useCallback } from 'react';
import api from '../api/client.js';

export const useFeedback = (eventId) => {
  const [feedback, setFeedback] = useState(null);
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState(null);

  const fetchFeedback = useCallback(async () => {
    if (!eventId) return;
    
    setStatus('loading');
    setError(null);
    
    try {
      const { data } = await api.get(`/events/${eventId}/feedback`);
      setFeedback(data.feedback);
      setStatus('success');
      return { success: true, feedback: data.feedback };
    } catch (err) {
      if (err.response?.status === 404) {
        setFeedback(null);
        setStatus('success');
        return { success: true, feedback: null };
      }
      const errorMsg = err.response?.data?.error || 'Failed to fetch feedback';
      setError(errorMsg);
      setStatus('error');
      return { success: false, error: errorMsg };
    }
  }, [eventId]);

  const submitFeedback = useCallback(async (feedbackData) => {
    setStatus('loading');
    setError(null);
    
    try {
      const { data } = await api.post(`/events/${eventId}/feedback`, feedbackData);
      setFeedback(data.feedback);
      setStatus('success');
      return { success: true, feedback: data.feedback };
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to submit feedback';
      setError(errorMsg);
      setStatus('error');
      return { success: false, error: errorMsg };
    }
  }, [eventId]);

  return {
    feedback,
    status,
    error,
    fetchFeedback,
    submitFeedback,
  };
};

