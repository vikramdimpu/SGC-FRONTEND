import React from 'react';

export default function Navbar({ totalStudents, isServerOnline }) {
  return (
    <header className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand">
          <div className="brand-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
              <path d="M6 12v5c3 3 9 3 12 0v-5"/>
            </svg>
          </div>
          <div className="brand-text">
            <h1 className="brand-title">Student Grade Calculator</h1>
            <p className="brand-subtitle">Student Management System • Java Full Stack</p>
          </div>
        </div>

        <div className="navbar-meta">
          <div className={`status-pill ${isServerOnline ? 'online' : 'checking'}`}>
            <span className="status-dot"></span>
            <span>{isServerOnline ? 'Backend Online (Port 8080)' : 'Connecting to API...'}</span>
          </div>
          <div className="badge-pill">
            <span>Enrolled: <strong>{totalStudents}</strong></span>
          </div>
        </div>
      </div>
    </header>
  );
}
