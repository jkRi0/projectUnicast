import { useState, useCallback } from 'react';
import api from '../api/client.js';

export const useRSVP = (eventId) => {
  const [rsvp, setRSVP] = useState(null);
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState(null);

  const fetchRSVP = useCallback(async () => {
    if (!eventId) return;
    
    setStatus('loading');
    setError(null);
    
    try {
      const { data } = await api.get(`/events/${eventId}/rsvp`);
      setRSVP(data.rsvp);
      setStatus('success');
      return { success: true, rsvp: data.rsvp };
    } catch (err) {
      if (err.response?.status === 404) {
        // No RSVP yet
        setRSVP(null);
        setStatus('success');
        return { success: true, rsvp: null };
      }
      const errorMsg = err.response?.data?.error || 'Failed to fetch RSVP';
      setError(errorMsg);
      setStatus('error');
      return { success: false, error: errorMsg };
    }
  }, [eventId]);

  const submitRSVP = useCallback(async (rsvpStatus, notes = '') => {
    setStatus('loading');
    setError(null);
    
    try {
      const { data } = await api.post(`/events/${eventId}/rsvp`, {
        status: rsvpStatus,
        notes,
      });
      setRSVP(data.rsvp);
      setStatus('success');
      return { success: true, rsvp: data.rsvp };
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to submit RSVP';
      setError(errorMsg);
      setStatus('error');
      return { success: false, error: errorMsg };
    }
  }, [eventId]);

  const updateRSVP = useCallback(async (rsvpStatus, notes = '') => {
    setStatus('loading');
    setError(null);
    
    try {
      const { data } = await api.put(`/events/${eventId}/rsvp`, {
        status: rsvpStatus,
        notes,
      });
      setRSVP(data.rsvp);
      setStatus('success');
      return { success: true, rsvp: data.rsvp };
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to update RSVP';
      setError(errorMsg);
      setStatus('error');
      return { success: false, error: errorMsg };
    }
  }, [eventId]);

  return {
    rsvp,
    status,
    error,
    fetchRSVP,
    submitRSVP,
    updateRSVP,
  };
};

