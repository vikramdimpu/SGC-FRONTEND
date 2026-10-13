import React from 'react';

export default function AlertBanner({ alert, onDismiss }) {
  if (!alert) return null;

  const isSuccess = alert.type === 'success';

  return (
    <div className={`alert-banner ${isSuccess ? 'alert-success' : 'alert-danger'}`} role="alert">
      <div className="alert-content">
        <div className="alert-icon">
          {isSuccess ? (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
          )}
        </div>
        <div className="alert-body">
          <strong className="alert-title">{alert.title || (isSuccess ? 'Success' : 'Error')}</strong>
          <p className="alert-message">{alert.message}</p>
        </div>
      </div>
      <button type="button" className="alert-close" onClick={onDismiss} aria-label="Close notification">
        ✕
      </button>
    </div>
  );
}
