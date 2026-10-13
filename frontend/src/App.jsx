import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import StudentDashboard from './pages/StudentDashboard';
import AdminDashboard from './pages/AdminDashboard';
import './App.css';

function MainApp() {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="full-page-loader">
        <div className="spinner-lg"></div>
        <p className="loader-text">Connecting to B.Tech Academic Management System...</p>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <LoginPage />;
  }

  if (user.role === 'ROLE_ADMIN') {
    return <AdminDashboard />;
  }

  return <StudentDashboard />;
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
