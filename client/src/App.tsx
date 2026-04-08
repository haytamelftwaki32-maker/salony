import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import { useAuthStore } from './store/authStore';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import BarberDashboard from './pages/BarberDashboard';

import ClientDashboard from './pages/ClientDashboard';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  const { checkAuth, isAuthenticated, user } = useAuthStore();
  const { i18n } = useTranslation();

  useEffect(() => {
    document.documentElement.dir = i18n.language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = i18n.language;
  }, [i18n.language]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Loading state can be handled here if needed, for MVP we do basic redirect

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={
            isAuthenticated ? (
              user?.role === 'ADMIN' ? <AdminDashboard /> :
                user?.role === 'BARBER' ? <BarberDashboard /> : <ClientDashboard />
            ) : (
              <Navigate to="/login" replace />
            )
          } />
          <Route path="login" element={!isAuthenticated ? <Login /> : <Navigate to="/" replace />} />
          <Route path="register" element={!isAuthenticated ? <Register /> : <Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
