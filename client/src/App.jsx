import { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';

import Layout from './components/Layout.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import LoginPage from './pages/LoginPage.jsx';
import HomePage from './pages/HomePage.jsx';
import EventsPage from './pages/EventsPage.jsx';
import EventDetailsPage from './pages/EventDetailsPage.jsx';
import MyEventsPage from './pages/MyEventsPage.jsx';
import MyRSVPsPage from './pages/MyRSVPsPage.jsx';
import AnalyticsPage from './pages/AnalyticsPage.jsx';
import OfflinePage from './pages/OfflinePage.jsx';
import { useAuthContext } from './context/AuthContext.jsx';

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

const TitleUpdater = () => {
  const location = useLocation();

  useEffect(() => {
    const titles = {
      '/': 'Home',
      '/login': 'Login',
      '/events': 'Browse Events',
      '/my-events': 'My Events',
      '/my-rsvps': 'My RSVPs',
      '/analytics': 'Analytics',
      '/offline': 'Offline',
    };

    const baseTitle = 'UniEvent - Personalized Event Planning';
    const pageTitle = titles[location.pathname] || 
      (location.pathname.startsWith('/events/') ? 'Event Details' : null);
    
    if (pageTitle) {
      document.title = `${pageTitle} - UniEvent`;
    } else {
      document.title = baseTitle;
    }
  }, [location.pathname]);

  return null;
};

const App = () => {
  const { bootstrap, authStatus, user } = useAuthContext();

  useEffect(() => {
    bootstrap();
  }, [bootstrap]);

  if (authStatus === 'loading' || authStatus === 'idle') {
    return (
      <div className="app-loading">
        <div className="spinner" role="status" aria-live="polite" />
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <Layout>
      <TitleUpdater />
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/events" element={<EventsPage />} />
        <Route path="/events/:id" element={<EventDetailsPage />} />
        <Route
          path="/my-events"
          element={
            <ProtectedRoute>
              <MyEventsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-rsvps"
          element={
            <ProtectedRoute>
              <MyRSVPsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/analytics"
          element={
            <ProtectedRoute>
              <AnalyticsPage />
            </ProtectedRoute>
          }
        />
        <Route path="/offline" element={<OfflinePage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
};

export default App;
