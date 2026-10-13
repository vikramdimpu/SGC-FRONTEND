import React from 'react';

export default function SummaryCards({ students = [] }) {
  const total = students.length;

  const totalPercentage = students.reduce((acc, s) => acc + (Number(s.percentage) || 0), 0);
  const averagePercentage = total > 0 ? (totalPercentage / total).toFixed(2) : '0.00';

  const highestPercentage = total > 0
    ? Math.max(...students.map(s => Number(s.percentage) || 0)).toFixed(2)
    : '0.00';

  const passedCount = students.filter(s => s.status === 'PASS').length;
  const failedCount = students.filter(s => s.status === 'FAIL').length;
  const passRate = total > 0 ? ((passedCount / total) * 100).toFixed(1) : '0.0';

  return (
    <div className="summary-grid">
      <div className="stat-card">
        <div className="stat-icon icon-students">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
        </div>
        <div className="stat-content">
          <span className="stat-label">Total Students</span>
          <span className="stat-value">{total}</span>
          <span className="stat-help">Enrolled in system</span>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-icon icon-average">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="20" x2="18" y2="10"/>
            <line x1="12" y1="20" x2="12" y2="4"/>
            <line x1="6" y1="20" x2="6" y2="14"/>
          </svg>
        </div>
        <div className="stat-content">
          <span className="stat-label">Class Average</span>
          <span className="stat-value">{averagePercentage}%</span>
          <span className="stat-help">Overall cohort score</span>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-icon icon-highest">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="8" r="7"/>
            <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/>
          </svg>
        </div>
        <div className="stat-content">
          <span className="stat-label">Highest Score</span>
          <span className="stat-value">{highestPercentage}%</span>
          <span className="stat-help">Top performing mark</span>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-icon icon-passed">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
            <polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
        </div>
        <div className="stat-content">
          <span className="stat-label">Passed</span>
          <span className="stat-value text-success">{passedCount} <span className="stat-sub">({passRate}%)</span></span>
          <span className="stat-help">Grades A, B, C, D</span>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-icon icon-failed">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <line x1="15" y1="9" x2="9" y2="15"/>
            <line x1="9" y1="9" x2="15" y2="15"/>
          </svg>
        </div>
        <div className="stat-content">
          <span className="stat-label">Failed</span>
          <span className="stat-value text-danger">{failedCount}</span>
          <span className="stat-help">Grade F (Below 40%)</span>
        </div>
      </div>
    </div>
  );
}
