import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import studentService from '../api/studentService';

export default function StudentDashboard() {
  const { user, logout, changePassword } = useAuth();
  const [report, setReport] = useState(null);
  const [selectedSemester, setSelectedSemester] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [showFormulaModal, setShowFormulaModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  // Password change state
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [passwordMsg, setPasswordMsg] = useState({ text: '', isError: false });
  const [isChangingPass, setIsChangingPass] = useState(false);

  const fetchReport = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      const data = await studentService.getMyAcademicReport();
      setReport(data);
      if (data.semesters && data.semesters.length > 0) {
        setSelectedSemester(data.semesters[data.semesters.length - 1].semester);
      }
    } catch (err) {
      setErrorMessage(
        err.response?.data?.message || 'Failed to fetch academic records. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!currentPass || !newPass) {
      setPasswordMsg({ text: 'Please fill in both fields.', isError: true });
      return;
    }
    setIsChangingPass(true);
    setPasswordMsg({ text: '', isError: false });
    try {
      await changePassword(currentPass, newPass);
      setPasswordMsg({ text: 'Password successfully changed!', isError: false });
      setCurrentPass('');
      setNewPass('');
      setTimeout(() => setShowPasswordModal(false), 1500);
    } catch (err) {
      setPasswordMsg({
        text: err.response?.data?.message || 'Failed to update password.',
        isError: true,
      });
    } finally {
      setIsChangingPass(false);
    }
  };

  const getGradeBadgeClass = (grade) => {
    switch (grade) {
      case 'O':
        return 'badge-grade grade-o';
      case 'A+':
      case 'A':
        return 'badge-grade grade-a';
      case 'B+':
      case 'B':
        return 'badge-grade grade-b';
      case 'C':
        return 'badge-grade grade-c';
      case 'P':
        return 'badge-grade grade-p';
      case 'F':
      default:
        return 'badge-grade grade-f';
    }
  };

  const currentSemesterSummary = report?.semesters?.find((s) => s.semester === selectedSemester);

  return (
    <div className="portal-container">
      {/* Navigation Header */}
      <header className="portal-navbar">
        <div className="navbar-container">
          <div className="portal-brand">
            <div className="brand-crest">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
                <path d="M6 12v5c3 3 9 3 12 0v-5"/>
              </svg>
            </div>
            <div>
              <h1 className="portal-title">B.Tech Student Academic Portal</h1>
              <span className="portal-subtitle">Student Grade & Performance Transcript</span>
            </div>
          </div>

          <div className="portal-nav-actions">
            <button
              type="button"
              className="btn btn-outline-light"
              onClick={() => setShowFormulaModal(true)}
            >
              ℹ️ SGPA / CGPA Method
            </button>
            <button
              type="button"
              className="btn btn-outline-light"
              onClick={() => setShowPasswordModal(true)}
            >
              🔒 Change Password
            </button>
            <button
              type="button"
              className="btn btn-danger-sm"
              onClick={logout}
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className="portal-main">
        {isLoading ? (
          <div className="portal-loading">
            <div className="spinner-lg"></div>
            <p>Loading your verified academic records from Spring Boot backend...</p>
          </div>
        ) : errorMessage ? (
          <div className="alert-banner alert-danger">
            <span>{errorMessage}</span>
          </div>
        ) : report ? (
          <>
            {/* Student Profile Card */}
            <div className="card profile-banner-card">
              <div className="profile-banner-content">
                <div className="student-avatar">
                  {report.name?.charAt(0) || 'S'}
                </div>
                <div className="profile-info-block">
                  <div className="profile-title-row">
                    <h2 className="student-name">{report.name}</h2>
                    <span className="badge-roll">{report.rollNumber}</span>
                    <span className="badge-active">ACTIVE STUDENT</span>
                  </div>
                  <div className="profile-meta-grid">
                    <div>
                      <span className="meta-label">Department:</span>
                      <strong>{report.department}</strong>
                    </div>
                    <div>
                      <span className="meta-label">Branch:</span>
                      <strong>{report.branch}</strong>
                    </div>
                    <div>
                      <span className="meta-label">Academic Batch:</span>
                      <strong>{report.academicYear}</strong>
                    </div>
                    <div>
                      <span className="meta-label">Current Semester:</span>
                      <strong>Semester {report.currentSemester} (Sec {report.section})</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Overall Academic Performance Metric Cards */}
            <div className="summary-grid">
              <div className="stat-card stat-cgpa">
                <div className="stat-content">
                  <span className="stat-label">Cumulative CGPA</span>
                  <div className="stat-highlight">
                    <span className="stat-value">{Number(report.cgpa).toFixed(2)}</span>
                    <span className="stat-denom">/ 10.0</span>
                  </div>
                  <span className="stat-help">Across all completed semesters</span>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-content">
                  <span className="stat-label">Current Sem SGPA</span>
                  <div className="stat-highlight">
                    <span className="stat-value">
                      {currentSemesterSummary ? Number(currentSemesterSummary.sgpa).toFixed(2) : '0.00'}
                    </span>
                    <span className="stat-denom">/ 10.0</span>
                  </div>
                  <span className="stat-help">Semester {selectedSemester} performance</span>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-content">
                  <span className="stat-label">Total Credits Earned</span>
                  <div className="stat-highlight">
                    <span className="stat-value text-success">{report.totalCreditsEarned}</span>
                    <span className="stat-denom">/ {report.totalCreditsAttempted} Attempted</span>
                  </div>
                  <span className="stat-help">Officially verified credits</span>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-content">
                  <span className="stat-label">Active Backlogs</span>
                  <div className="stat-highlight">
                    <span className={`stat-value ${report.totalBacklogs > 0 ? 'text-danger' : 'text-success'}`}>
                      {report.totalBacklogs}
                    </span>
                  </div>
                  <span className="stat-help">
                    {report.totalBacklogs === 0 ? 'No active backlogs (All Clear)' : 'Subjects requiring re-exam'}
                  </span>
                </div>
              </div>
            </div>

            {/* Semester Navigation Tabs */}
            <div className="card results-card">
              <div className="card-header-tabs">
                <div className="sem-tabs-group">
                  <span className="tab-group-title">Select Semester:</span>
                  {report.semesters && report.semesters.length > 0 ? (
                    report.semesters.map((s) => (
                      <button
                        key={s.semester}
                        type="button"
                        className={`sem-tab-btn ${selectedSemester === s.semester ? 'active' : ''}`}
                        onClick={() => setSelectedSemester(s.semester)}
                      >
                        Semester {s.semester}
                        <span className="tab-sgpa">SGPA: {Number(s.sgpa).toFixed(2)}</span>
                      </button>
                    ))
                  ) : (
                    <span className="text-muted">No published semesters yet.</span>
                  )}
                </div>

                {currentSemesterSummary && (
                  <div className="sem-summary-badge">
                    <span>Sem {selectedSemester} Result: </span>
                    <strong className={currentSemesterSummary.status === 'PASS' ? 'text-success' : 'text-danger'}>
                      {currentSemesterSummary.status}
                    </strong>
                    <span> • Credits: <strong>{currentSemesterSummary.earnedCredits} / {currentSemesterSummary.registeredCredits}</strong></span>
                  </div>
                )}
              </div>

              {/* Subject-Wise Marks & Grade Table */}
              <div className="table-responsive">
                {currentSemesterSummary && currentSemesterSummary.subjects && currentSemesterSummary.subjects.length > 0 ? (
                  <table className="student-table academic-table">
                    <thead>
                      <tr>
                        <th>Code</th>
                        <th>Subject Name</th>
                        <th>Type</th>
                        <th className="text-center">Credits</th>
                        <th className="text-center">Internal (Obt / Max)</th>
                        <th className="text-center">External (Obt / Max)</th>
                        <th className="text-center">Total Marks</th>
                        <th className="text-center">%</th>
                        <th className="text-center">Grade</th>
                        <th className="text-center">Grade Points</th>
                        <th className="text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentSemesterSummary.subjects.map((sub) => (
                        <tr key={sub.id || sub.subjectCode} className={sub.status === 'FAIL' ? 'row-backlog' : ''}>
                          <td>
                            <span className="badge-code">{sub.subjectCode}</span>
                          </td>
                          <td>
                            <strong>{sub.subjectName}</strong>
                          </td>
                          <td>
                            <span className="type-badge">{sub.type}</span>
                          </td>
                          <td className="text-center font-bold">{sub.credits}</td>
                          <td className="text-center">
                            {sub.internalMarks} <span className="denom">/ {sub.internalMax}</span>
                          </td>
                          <td className="text-center">
                            {sub.externalMarks} <span className="denom">/ {sub.externalMax}</span>
                          </td>
                          <td className="text-center font-bold">
                            {sub.totalMarks} <span className="denom">/ {sub.totalMax}</span>
                          </td>
                          <td className="text-center">{Number(sub.percentage).toFixed(1)}%</td>
                          <td className="text-center">
                            <span className={getGradeBadgeClass(sub.grade)}>{sub.grade}</span>
                          </td>
                          <td className="text-center font-bold">{sub.gradePoints}</td>
                          <td className="text-center">
                            <span className={`status-pill-sub ${sub.status === 'PASS' ? 'pass' : 'fail'}`}>
                              {sub.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="table-state-empty">
                    <p>No published subject results found for Semester {selectedSemester}.</p>
                  </div>
                )}
              </div>
            </div>
          </>
        ) : null}
      </main>

      {/* SGPA & CGPA Calculation Method Modal */}
      {showFormulaModal && (
        <div className="modal-backdrop">
          <div className="modal-card wide-modal" role="dialog">
            <h3 className="modal-title">B.Tech Grading & CGPA Calculation Standards</h3>
            <div className="modal-body-scroll text-left">
              <h4>1. Semester Grade Point Average (SGPA) Formula:</h4>
              <p className="formula-box">
                <code>SGPA = [ ∑ (Subject Credits × Subject Grade Points) ] / [ ∑ Subject Credits ]</code>
              </p>
              <p>
                Earned credits are awarded only for subjects where the student achieves a passing grade (Grades O through P). Failed subjects receive 0 grade points and count towards the denominator.
              </p>

              <h4>2. Cumulative Grade Point Average (CGPA) Formula:</h4>
              <p className="formula-box">
                <code>CGPA = [ ∑ (Credits in Sem i × SGPA of Sem i) ] / [ ∑ Registered Credits in all Completed Semesters ]</code>
              </p>

              <h4>3. 10-Point Letter Grading Scale:</h4>
              <table className="mini-grading-table">
                <thead>
                  <tr>
                    <th>Percentage (%)</th>
                    <th>Grade</th>
                    <th>Grade Points</th>
                    <th>Description</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td>≥ 90%</td><td><span className="badge-grade grade-o">O</span></td><td>10.0</td><td>Outstanding</td></tr>
                  <tr><td>80 - 89.9%</td><td><span className="badge-grade grade-a">A+</span></td><td>9.0</td><td>Excellent</td></tr>
                  <tr><td>70 - 79.9%</td><td><span className="badge-grade grade-a">A</span></td><td>8.0</td><td>Very Good</td></tr>
                  <tr><td>60 - 69.9%</td><td><span className="badge-grade grade-b">B+</span></td><td>7.0</td><td>Good</td></tr>
                  <tr><td>55 - 59.9%</td><td><span className="badge-grade grade-b">B</span></td><td>6.0</td><td>Above Average</td></tr>
                  <tr><td>50 - 54.9%</td><td><span className="badge-grade grade-c">C</span></td><td>5.0</td><td>Average</td></tr>
                  <tr><td>40 - 49.9%</td><td><span className="badge-grade grade-p">P</span></td><td>4.0</td><td>Pass</td></tr>
                  <tr><td>&lt; 40%</td><td><span className="badge-grade grade-f">F</span></td><td>0.0</td><td>Fail / Backlog</td></tr>
                </tbody>
              </table>

              <h4>4. Mandatory Passing Requirements:</h4>
              <p>
                Students must achieve the mandatory minimum external examination marks (typically 25 / 70) and total marks (40 / 100) to pass a course. Failing the external minimum automatically results in Grade F, even if internal marks are high.
              </p>
            </div>

            <div className="modal-actions">
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => setShowFormulaModal(false)}
              >
                Close & Return
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="modal-backdrop">
          <div className="modal-card" role="dialog">
            <h3 className="modal-title">Change Account Password</h3>
            <form onSubmit={handlePasswordSubmit} className="student-form">
              {passwordMsg.text && (
                <div className={`alert-banner ${passwordMsg.isError ? 'alert-danger' : 'alert-success'}`}>
                  <span>{passwordMsg.text}</span>
                </div>
              )}

              <div className="form-group text-left">
                <label className="form-label">Current Password:</label>
                <input
                  type="password"
                  className="form-input"
                  value={currentPass}
                  onChange={(e) => setCurrentPass(e.target.value)}
                  placeholder="Enter current password"
                  required
                />
              </div>

              <div className="form-group text-left">
                <label className="form-label">New Password (min 6 characters):</label>
                <input
                  type="password"
                  className="form-input"
                  value={newPass}
                  onChange={(e) => setNewPass(e.target.value)}
                  placeholder="Enter new password"
                  required
                  minLength={6}
                />
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowPasswordModal(false)}
                  disabled={isChangingPass}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isChangingPass}
                >
                  {isChangingPass ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
