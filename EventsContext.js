import React, { createContext, useContext, useState } from 'react';
import { getEvents, randomImage } from './api';

const EventsContext = createContext(null);

export const useEvents = () => useContext(EventsContext);

export const EventsProvider = ({ children }) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const withImage = (item) => ({ ...item, cover: randomImage() });

  const loadEvents = async () => {
    setLoading(true);
    setError('');
    try {
      const list = await getEvents();
      setEvents(list.map(withImage));
    } catch (e) {
      setError('Could not load events. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const addLocal = (created) => {
    setEvents((prev) => [withImage(created), ...prev]);
  };

  const updateLocal = (id, changes) => {
    setEvents((prev) => prev.map((e) => (e.id === id ? { ...e, ...changes } : e)));
  };

  const removeLocal = (id) => {
    setEvents((prev) => prev.filter((e) => e.id !== id));
  };

  return (
    <EventsContext.Provider
      value={{ events, loading, error, loadEvents, addLocal, updateLocal, removeLocal }}
    >
      {children}
    </EventsContext.Provider>
  );
};
