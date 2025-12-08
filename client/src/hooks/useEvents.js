import { useState, useEffect, useCallback } from 'react';
import api from '../api/client.js';

export const useEvents = () => {
  const [events, setEvents] = useState([]);
  const [status, setStatus] = useState('idle'); // idle, loading, success, error
  const [error, setError] = useState(null);

  const fetchEvents = useCallback(async () => {
    setStatus('loading');
    setError(null);
    
    try {
      const { data } = await api.get('/events');
      setEvents(data.events || []);
      setStatus('success');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch events');
      setStatus('error');
      console.error('Error fetching events:', err);
    }
  }, []);

  const createEvent = useCallback(async (eventData) => {
    setStatus('loading');
    setError(null);
    
    try {
      const { data } = await api.post('/events', eventData);
      setEvents((prev) => [data.event, ...prev]);
      setStatus('success');
      return { success: true, event: data.event };
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to create event';
      setError(errorMsg);
      setStatus('error');
      return { success: false, error: errorMsg };
    }
  }, []);

  const updateEvent = useCallback(async (eventId, eventData) => {
    setStatus('loading');
    setError(null);
    
    try {
      const { data } = await api.put(`/events/${eventId}`, eventData);
      setEvents((prev) =>
        prev.map((event) => (event._id === eventId ? data.event : event))
      );
      setStatus('success');
      return { success: true, event: data.event };
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to update event';
      setError(errorMsg);
      setStatus('error');
      return { success: false, error: errorMsg };
    }
  }, []);

  const deleteEvent = useCallback(async (eventId) => {
    setStatus('loading');
    setError(null);
    
    try {
      await api.delete(`/events/${eventId}`);
      setEvents((prev) => prev.filter((event) => event._id !== eventId));
      setStatus('success');
      return { success: true };
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to delete event';
      setError(errorMsg);
      setStatus('error');
      return { success: false, error: errorMsg };
    }
  }, []);

  const getEvent = useCallback(async (eventId) => {
    try {
      const { data } = await api.get(`/events/${eventId}`);
      return { success: true, event: data.event };
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to fetch event';
      return { success: false, error: errorMsg };
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  return {
    events,
    status,
    error,
    fetchEvents,
    createEvent,
    updateEvent,
    deleteEvent,
    getEvent,
  };
};

