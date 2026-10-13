import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setErrorMessage('Please enter both your enrollment ID / username and password.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      await login(username.trim(), password);
    } catch (err) {
      const msg = err.response?.data?.message ||
        (err.code === 'ERR_NETWORK'
          ? 'Cannot connect to backend server at http://localhost:8080. Ensure Spring Boot is running.'
          : 'Invalid credentials or inactive account.');
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickDemo = (demoUser, demoPass) => {
    setUsername(demoUser);
    setPassword(demoPass);
    setErrorMessage('');
  };

  return (
    <div className="login-page">
      <div className="login-card-wrapper">
        <div className="login-header">
          <div className="login-crest">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
              <path d="M6 12v5c3 3 9 3 12 0v-5"/>
            </svg>
          </div>
          <h1 className="login-title">B.Tech Academic Management Portal</h1>
          <p className="login-subtitle">
            Secure Student Grade & Result Verification System • Spring Boot + React
          </p>
        </div>

        {errorMessage && (
          <div className="login-alert-danger" role="alert">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="alert-svg">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="login-username" className="form-label">
              Enrollment ID / Roll Number or Username
            </label>
            <input
              type="text"
              id="login-username"
              className="form-input"
              placeholder="e.g. 21B91A0501 or admin"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoFocus
            />
          </div>

          <div className="form-group">
            <label htmlFor="login-password" className="form-label">
              Account Password
            </label>
            <input
              type="password"
              id="login-password"
              className="form-input"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-block"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span className="spinner-sm"></span>
                <span>Authenticating with Spring Security...</span>
              </>
            ) : (
              'Sign In to Academic Portal'
            )}
          </button>
        </form>

        {/* Quick Demo Credentials Panel for College Presentation / Viva */}
        <div className="demo-credentials-box">
          <span className="demo-label">Quick Demo Access (Viva & Testing):</span>
          <div className="demo-btn-group">
            <button
              type="button"
              className="btn-demo"
              onClick={() => handleQuickDemo('admin', 'Admin@1234')}
            >
              👑 Admin (admin)
            </button>
            <button
              type="button"
              className="btn-demo"
              onClick={() => handleQuickDemo('21B91A0501', 'Student@123')}
            >
              🎓 Student 1 (21B91A0501)
            </button>
            <button
              type="button"
              className="btn-demo"
              onClick={() => handleQuickDemo('21B91A0502', 'Student@123')}
            >
              🎓 Student 2 (21B91A0502)
            </button>
          </div>
          <small className="demo-note">
            Passwords: Admin = <code>Admin@1234</code> | Students = <code>Student@123</code>
          </small>
        </div>
      </div>
    </div>
  );
}
