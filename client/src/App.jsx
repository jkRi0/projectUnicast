import { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';

import Layout from './components/Layout.jsx';
import LoginPage from './pages/LoginPage.jsx';
import HomePage from './pages/HomePage.jsx';
import OfflinePage from './pages/OfflinePage.jsx';
import { useAuthContext } from './context/AuthContext.jsx';

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

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
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/offline" element={<OfflinePage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
};

export default App;
