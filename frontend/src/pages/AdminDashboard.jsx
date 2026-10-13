import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import adminService from '../api/adminService';

export default function AdminDashboard() {
  const { user, logout } = useAuth();

  const [activeTab, setActiveTab] = useState('students'); // 'students' | 'marks' | 'bulk' | 'subjects'

  // Students state
  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [branchFilter, setBranchFilter] = useState('ALL');
  const [semFilter, setSemFilter] = useState(0);
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);

  // Subjects state
  const [subjects, setSubjects] = useState([]);

  // Modals state
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showTranscriptModal, setShowTranscriptModal] = useState(false);
  const [selectedStudentReport, setSelectedStudentReport] = useState(null);
  const [showResetPassModal, setShowResetPassModal] = useState(false);
  const [selectedStudentForPass, setSelectedStudentForPass] = useState(null);
  const [newPasswordInput, setNewPasswordInput] = useState('Student@123');

  // Registration Form state
  const [regForm, setRegForm] = useState({
    rollNumber: '',
    name: '',
    email: '',
    department: 'Computer Science & Engineering',
    branch: 'CSE',
    academicYear: '2023-2027',
    currentSemester: 1,
    section: 'A',
    initialPassword: 'Student@123',
  });
  const [regError, setRegError] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);

  // Marks Entry Form state
  const [marksForm, setMarksForm] = useState({
    rollNumber: '',
    subjectCode: '',
    semester: 1,
    internalMarks: '',
    externalMarks: '',
  });
  const [marksMsg, setMarksMsg] = useState({ text: '', isError: false });
  const [isEnteringMarks, setIsEnteringMarks] = useState(false);

  // Publish Semester Results state
  const [publishSem, setPublishSem] = useState(1);
  const [publishMsg, setPublishMsg] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);

  // Bulk CSV state
  const [csvText, setCsvText] = useState(
    'RollNumber,SubjectCode,Semester,InternalMarks,ExternalMarks\n21B91A0501,CS101,1,28,64\n21B91A0501,CS102,1,26,58\n21B91A0502,CS101,1,29,66'
  );
  const [csvLogs, setCsvLogs] = useState([]);
  const [isUploadingCsv, setIsUploadingCsv] = useState(false);

  // Subject Form state
  const [subjectForm, setSubjectForm] = useState({
    code: '',
    name: '',
    branch: 'CSE',
    semester: 1,
    type: 'THEORY',
    credits: 3.0,
    internalMaxMarks: 30.0,
    externalMaxMarks: 70.0,
    internalMinPassMarks: 0.0,
    externalMinPassMarks: 25.0,
    totalMinPassMarks: 40.0,
  });
  const [subjectMsg, setSubjectMsg] = useState({ text: '', isError: false });
  const [isCreatingSubject, setIsCreatingSubject] = useState(false);

  // Global Alert
  const [alert, setAlert] = useState(null);

  const fetchStudents = useCallback(async () => {
    setIsLoadingStudents(true);
    try {
      const data = await adminService.getAllStudents({
        search: searchTerm,
        branch: branchFilter,
        semester: semFilter,
      });
      setStudents(data);
    } catch (err) {
      setAlert({
        type: 'error',
        message: err.response?.data?.message || 'Failed to load students.',
      });
    } finally {
      setIsLoadingStudents(false);
    }
  }, [searchTerm, branchFilter, semFilter]);

  const fetchSubjects = useCallback(async () => {
    try {
      const data = await adminService.getAllSubjects();
      setSubjects(data);
    } catch {
      // Ignore initial subject fetch error
    }
  }, []);

  useEffect(() => {
    fetchStudents();
    fetchSubjects();
  }, [fetchStudents, fetchSubjects]);

  // Handle Student Registration
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setIsRegistering(true);
    setRegError('');
    try {
      await adminService.registerStudent(regForm);
      setAlert({
        type: 'success',
        message: `Student "${regForm.name}" (${regForm.rollNumber}) registered successfully with login credentials!`,
      });
      setShowRegisterModal(false);
      setRegForm({
        rollNumber: '',
        name: '',
        email: '',
        department: 'Computer Science & Engineering',
        branch: 'CSE',
        academicYear: '2023-2027',
        currentSemester: 1,
        section: 'A',
        initialPassword: 'Student@123',
      });
      fetchStudents();
    } catch (err) {
      setRegError(err.response?.data?.message || 'Registration failed. Check roll number format or duplicates.');
    } finally {
      setIsRegistering(false);
    }
  };

  // Toggle Student Status
  const handleToggleStatus = async (id, name) => {
    try {
      const updated = await adminService.toggleStatus(id);
      setAlert({
        type: 'success',
        message: `Account for ${name} is now ${updated.active ? 'ACTIVE' : 'DEACTIVATED'}.`,
      });
      fetchStudents();
    } catch (err) {
      setAlert({ type: 'error', message: err.response?.data?.message || 'Action failed.' });
    }
  };

  // Reset Student Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!selectedStudentForPass) return;
    try {
      await adminService.resetPassword(selectedStudentForPass.id, newPasswordInput);
      setAlert({
        type: 'success',
        message: `Password reset successfully for roll number ${selectedStudentForPass.rollNumber}.`,
      });
      setShowResetPassModal(false);
    } catch (err) {
      setAlert({ type: 'error', message: err.response?.data?.message || 'Password reset failed.' });
    }
  };

  // View Student Full Academic Transcript
  const handleViewTranscript = async (studentId) => {
    try {
      const report = await adminService.getStudentAcademicReport(studentId);
      setSelectedStudentReport(report);
      setShowTranscriptModal(true);
    } catch (err) {
      setAlert({ type: 'error', message: err.response?.data?.message || 'Failed to fetch transcript.' });
    }
  };

  // Enter Marks
  const handleMarksSubmit = async (e) => {
    e.preventDefault();
    setIsEnteringMarks(true);
    setMarksMsg({ text: '', isError: false });
    try {
      const payload = {
        rollNumber: marksForm.rollNumber.trim(),
        subjectCode: marksForm.subjectCode.trim(),
        semester: Number(marksForm.semester),
        internalMarks: parseFloat(marksForm.internalMarks),
        externalMarks: parseFloat(marksForm.externalMarks),
      };
      const result = await adminService.enterMarks(payload);
      setMarksMsg({
        text: `Marks saved successfully! Total: ${result.totalMarks}, Grade: ${result.grade} (${result.status}). Note: Publish results when ready to make them visible to student.`,
        isError: false,
      });
      setMarksForm((prev) => ({
        ...prev,
        internalMarks: '',
        externalMarks: '',
      }));
    } catch (err) {
      setMarksMsg({
        text: err.response?.data?.message || 'Failed to enter marks. Verify roll number, subject code, and max limits.',
        isError: true,
      });
    } finally {
      setIsEnteringMarks(false);
    }
  };

  // Publish Semester Results
  const handlePublishSemester = async () => {
    setIsPublishing(true);
    setPublishMsg('');
    try {
      const res = await adminService.publishSemester(publishSem);
      setPublishMsg(res.message);
      setAlert({ type: 'success', message: res.message });
    } catch (err) {
      setPublishMsg(err.response?.data?.message || 'Failed to publish results.');
    } finally {
      setIsPublishing(false);
    }
  };

  // Bulk CSV Upload
  const handleBulkCsvUpload = async () => {
    setIsUploadingCsv(true);
    setCsvLogs([]);
    try {
      const logs = await adminService.uploadBulkCsv(csvText);
      setCsvLogs(logs);
      setAlert({ type: 'success', message: 'Bulk CSV marks processed.' });
    } catch (err) {
      setAlert({ type: 'error', message: err.response?.data?.message || 'CSV processing failed.' });
    } finally {
      setIsUploadingCsv(false);
    }
  };

  // Create Subject
  const handleSubjectSubmit = async (e) => {
    e.preventDefault();
    setIsCreatingSubject(true);
    setSubjectMsg({ text: '', isError: false });
    try {
      const res = await adminService.createSubject({
        ...subjectForm,
        semester: Number(subjectForm.semester),
        credits: parseFloat(subjectForm.credits),
        internalMaxMarks: parseFloat(subjectForm.internalMaxMarks),
        externalMaxMarks: parseFloat(subjectForm.externalMaxMarks),
        internalMinPassMarks: parseFloat(subjectForm.internalMinPassMarks),
        externalMinPassMarks: parseFloat(subjectForm.externalMinPassMarks),
        totalMinPassMarks: parseFloat(subjectForm.totalMinPassMarks),
      });
      setSubjectMsg({ text: `Subject "${res.name}" (${res.code}) created successfully!`, isError: false });
      fetchSubjects();
      setSubjectForm({
        code: '',
        name: '',
        branch: 'CSE',
        semester: 1,
        type: 'THEORY',
        credits: 3.0,
        internalMaxMarks: 30.0,
        externalMaxMarks: 70.0,
        internalMinPassMarks: 0.0,
        externalMinPassMarks: 25.0,
        totalMinPassMarks: 40.0,
      });
    } catch (err) {
      setSubjectMsg({ text: err.response?.data?.message || 'Failed to create subject.', isError: true });
    } finally {
      setIsCreatingSubject(false);
    }
  };

  // Quick stats
  const totalCount = students.length;
  const activeCount = students.filter((s) => s.active).length;
  const inactiveCount = totalCount - activeCount;

  return (
    <div className="portal-container">
      {/* Header */}
      <header className="portal-navbar admin-navbar">
        <div className="navbar-container">
          <div className="portal-brand">
            <div className="brand-crest crest-admin">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                <path d="M2 17l10 5 10-5"/>
                <path d="M2 12l10 5 10-5"/>
              </svg>
            </div>
            <div>
              <h1 className="portal-title">Administrator Academic Control Center</h1>
              <span className="portal-subtitle">Student Registration, Marks Entry & Result Publication</span>
            </div>
          </div>

          <div className="portal-nav-actions">
            <span className="admin-user-tag">Admin: {user?.username}</span>
            <button type="button" className="btn btn-danger-sm" onClick={logout}>
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className="portal-main">
        {/* Global Alert */}
        {alert && (
          <div className={`alert-banner ${alert.type === 'success' ? 'alert-success' : 'alert-danger'}`}>
            <span>{alert.message}</span>
            <button type="button" className="alert-close" onClick={() => setAlert(null)}>✕</button>
          </div>
        )}

        {/* Admin Metric Overview Cards */}
        <div className="summary-grid">
          <div className="stat-card">
            <div className="stat-content">
              <span className="stat-label">Total Registered Students</span>
              <span className="stat-value">{totalCount}</span>
              <span className="stat-help">Verified in MySQL database</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-content">
              <span className="stat-label">Active Student Accounts</span>
              <span className="stat-value text-success">{activeCount}</span>
              <span className="stat-help">Permitted to log in</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-content">
              <span className="stat-label">Deactivated Accounts</span>
              <span className="stat-value text-danger">{inactiveCount}</span>
              <span className="stat-help">Access suspended</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-content">
              <span className="stat-label">Configured Subjects</span>
              <span className="stat-value">{subjects.length}</span>
              <span className="stat-help">Across all engineering branches</span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="admin-nav-tabs">
          <button
            type="button"
            className={`admin-tab-btn ${activeTab === 'students' ? 'active' : ''}`}
            onClick={() => setActiveTab('students')}
          >
            👥 Student Directory & Accounts
          </button>
          <button
            type="button"
            className={`admin-tab-btn ${activeTab === 'marks' ? 'active' : ''}`}
            onClick={() => setActiveTab('marks')}
          >
            📝 Marks Entry & Publishing
          </button>
          <button
            type="button"
            className={`admin-tab-btn ${activeTab === 'bulk' ? 'active' : ''}`}
            onClick={() => setActiveTab('bulk')}
          >
            📂 Bulk CSV Marks Import
          </button>
          <button
            type="button"
            className={`admin-tab-btn ${activeTab === 'subjects' ? 'active' : ''}`}
            onClick={() => setActiveTab('subjects')}
          >
            📚 Subjects & Curriculum Rules
          </button>
        </div>

        {/* TAB 1: Student Directory & Management */}
        {activeTab === 'students' && (
          <div className="card table-card">
            <div className="table-header-bar">
              <div>
                <h2 className="card-title">Enrolled B.Tech Students</h2>
                <p className="card-subtitle">Manage student enrollment, active status, and passwords</p>
              </div>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => setShowRegisterModal(true)}
              >
                + Register New Student
              </button>
            </div>

            {/* Filter Bar */}
            <div className="filter-bar">
              <div className="search-box">
                <input
                  type="text"
                  className="search-input"
                  placeholder="Search by student name or roll number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="filter-selects">
                <select
                  className="filter-select"
                  value={branchFilter}
                  onChange={(e) => setBranchFilter(e.target.value)}
                >
                  <option value="ALL">All Branches</option>
                  <option value="CSE">CSE</option>
                  <option value="ECE">ECE</option>
                  <option value="EEE">EEE</option>
                  <option value="MECH">MECH</option>
                  <option value="CIVIL">CIVIL</option>
                </select>

                <select
                  className="filter-select"
                  value={semFilter}
                  onChange={(e) => setSemFilter(Number(e.target.value))}
                >
                  <option value={0}>All Semesters</option>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                    <option key={n} value={n}>Semester {n}</option>
                  ))}
                </select>

                <button type="button" className="btn btn-outline" onClick={fetchStudents}>
                  Refresh
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="table-responsive">
              {isLoadingStudents ? (
                <div className="table-state-loading">
                  <div className="spinner-lg"></div>
                  <p>Loading students...</p>
                </div>
              ) : students.length === 0 ? (
                <div className="table-state-empty">
                  <h3>No students found</h3>
                  <p>No students match your filter or search query.</p>
                </div>
              ) : (
                <table className="student-table">
                  <thead>
                    <tr>
                      <th>Roll Number</th>
                      <th>Student Name</th>
                      <th>Department / Branch</th>
                      <th>Semester</th>
                      <th>Section</th>
                      <th>Account Status</th>
                      <th className="text-center">Admin Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((st) => (
                      <tr key={st.id}>
                        <td><span className="badge-code">{st.rollNumber}</span></td>
                        <td><strong>{st.name}</strong></td>
                        <td>{st.branch} ({st.department})</td>
                        <td>Semester {st.currentSemester}</td>
                        <td>{st.section}</td>
                        <td>
                          <span className={`status-pill-sub ${st.active ? 'pass' : 'fail'}`}>
                            {st.active ? 'ACTIVE' : 'DEACTIVATED'}
                          </span>
                        </td>
                        <td className="text-center">
                          <div className="action-btn-group">
                            <button
                              type="button"
                              className="btn-action btn-edit"
                              onClick={() => handleViewTranscript(st.id)}
                              title="Inspect Transcript"
                            >
                              📊 Transcript
                            </button>
                            <button
                              type="button"
                              className={`btn-action ${st.active ? 'btn-delete' : 'btn-edit'}`}
                              onClick={() => handleToggleStatus(st.id, st.name)}
                              title="Toggle Account Status"
                            >
                              {st.active ? 'Deactivate' : 'Activate'}
                            </button>
                            <button
                              type="button"
                              className="btn-action btn-outline"
                              onClick={() => {
                                setSelectedStudentForPass(st);
                                setShowResetPassModal(true);
                              }}
                              title="Reset Password"
                            >
                              🔑 Reset Pass
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: Marks Entry & Publishing */}
        {activeTab === 'marks' && (
          <div className="admin-grid-two">
            {/* Enter Subject Marks */}
            <div className="card form-card">
              <div className="card-header">
                <h2 className="card-title">Subject Marks Entry</h2>
                <p className="card-subtitle">Record internal & external examination scores for official verification</p>
              </div>

              <form onSubmit={handleMarksSubmit} className="student-form">
                {marksMsg.text && (
                  <div className={`alert-banner ${marksMsg.isError ? 'alert-danger' : 'alert-success'}`}>
                    <span>{marksMsg.text}</span>
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">Student Roll Number:</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. 21B91A0501"
                    value={marksForm.rollNumber}
                    onChange={(e) => setMarksForm({ ...marksForm, rollNumber: e.target.value })}
                    required
                  />
                  <small className="form-help">Enter valid registered student roll number</small>
                </div>

                <div className="form-row two-cols">
                  <div className="form-group">
                    <label className="form-label">Semester (1 - 8):</label>
                    <select
                      className="form-input"
                      value={marksForm.semester}
                      onChange={(e) => setMarksForm({ ...marksForm, semester: Number(e.target.value) })}
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                        <option key={n} value={n}>Semester {n}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Subject Code:</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. CS101, CS102, CS201"
                      value={marksForm.subjectCode}
                      onChange={(e) => setMarksForm({ ...marksForm, subjectCode: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="form-row two-cols">
                  <div className="form-group">
                    <label className="form-label">Internal Marks Obtained:</label>
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      className="form-input"
                      placeholder="e.g. 26.0"
                      value={marksForm.internalMarks}
                      onChange={(e) => setMarksForm({ ...marksForm, internalMarks: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">External Exam Marks Obtained:</label>
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      className="form-input"
                      placeholder="e.g. 62.0"
                      value={marksForm.externalMarks}
                      onChange={(e) => setMarksForm({ ...marksForm, externalMarks: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="form-actions">
                  <button type="submit" className="btn btn-primary" disabled={isEnteringMarks}>
                    {isEnteringMarks ? 'Recording...' : '💾 Save Official Subject Marks'}
                  </button>
                </div>
              </form>
            </div>

            {/* Publication Panel */}
            <div className="card form-card">
              <div className="card-header">
                <h2 className="card-title">Publish Semester Results</h2>
                <p className="card-subtitle">
                  Calculate SGPA & officially release results to students for public viewing
                </p>
              </div>

              <div className="student-form">
                {publishMsg && (
                  <div className="alert-banner alert-success">
                    <span>{publishMsg}</span>
                  </div>
                )}

                <p className="academic-note-box">
                  📢 <strong>Official Result Release Process:</strong><br />
                  Once marks entry is complete, publishing a semester will automatically compute each student's semester SGPA, verify passing/backlog requirements, and make the grades visible on their Student Dashboard.
                </p>

                <div className="form-group">
                  <label className="form-label">Target Semester to Publish:</label>
                  <select
                    className="form-input"
                    value={publishSem}
                    onChange={(e) => setPublishSem(Number(e.target.value))}
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                      <option key={n} value={n}>Semester {n}</option>
                    ))}
                  </select>
                </div>

                <button
                  type="button"
                  className="btn btn-primary btn-block"
                  onClick={handlePublishSemester}
                  disabled={isPublishing}
                >
                  {isPublishing ? 'Calculating & Publishing...' : `🚀 Publish Semester ${publishSem} Results for All Students`}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: Bulk CSV Marks Import */}
        {activeTab === 'bulk' && (
          <div className="card form-card">
            <div className="card-header">
              <h2 className="card-title">Bulk Marks CSV Import</h2>
              <p className="card-subtitle">
                Quickly import examination records for multiple students using validated CSV format
              </p>
            </div>

            <div className="student-form">
              <div className="academic-note-box">
                <strong>Format specification:</strong><br />
                <code>RollNumber,SubjectCode,Semester,InternalMarks,ExternalMarks</code>
              </div>

              <div className="form-group">
                <label className="form-label">Paste CSV Content Below:</label>
                <textarea
                  className="form-input form-textarea"
                  rows={8}
                  value={csvText}
                  onChange={(e) => setCsvText(e.target.value)}
                />
              </div>

              <button
                type="button"
                className="btn btn-primary"
                onClick={handleBulkCsvUpload}
                disabled={isUploadingCsv || !csvText.trim()}
              >
                {isUploadingCsv ? 'Validating & Importing...' : '📥 Process & Validate CSV Marks'}
              </button>

              {csvLogs.length > 0 && (
                <div className="csv-logs-container">
                  <h4>Processing Results & Validation Log:</h4>
                  <ul>
                    {csvLogs.map((log, idx) => (
                      <li key={idx} className={idx === 0 ? 'log-summary' : 'log-item'}>
                        {log}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 4: Subjects & Curriculum Rules */}
        {activeTab === 'subjects' && (
          <div className="admin-grid-two">
            {/* Create Subject Form */}
            <div className="card form-card">
              <div className="card-header">
                <h2 className="card-title">Add New Curriculum Subject</h2>
                <p className="card-subtitle">Configure credits, examination weights, and passing criteria</p>
              </div>

              <form onSubmit={handleSubjectSubmit} className="student-form">
                {subjectMsg.text && (
                  <div className={`alert-banner ${subjectMsg.isError ? 'alert-danger' : 'alert-success'}`}>
                    <span>{subjectMsg.text}</span>
                  </div>
                )}

                <div className="form-row two-cols">
                  <div className="form-group">
                    <label className="form-label">Subject Code:</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. CS301"
                      value={subjectForm.code}
                      onChange={(e) => setSubjectForm({ ...subjectForm, code: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Subject Name:</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Operating Systems"
                      value={subjectForm.name}
                      onChange={(e) => setSubjectForm({ ...subjectForm, name: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="form-row three-cols">
                  <div className="form-group">
                    <label className="form-label">Branch:</label>
                    <select
                      className="form-input"
                      value={subjectForm.branch}
                      onChange={(e) => setSubjectForm({ ...subjectForm, branch: e.target.value })}
                    >
                      <option value="CSE">CSE</option>
                      <option value="ECE">ECE</option>
                      <option value="EEE">EEE</option>
                      <option value="MECH">MECH</option>
                      <option value="CIVIL">CIVIL</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Semester:</label>
                    <select
                      className="form-input"
                      value={subjectForm.semester}
                      onChange={(e) => setSubjectForm({ ...subjectForm, semester: Number(e.target.value) })}
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                        <option key={n} value={n}>Semester {n}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Type:</label>
                    <select
                      className="form-input"
                      value={subjectForm.type}
                      onChange={(e) => setSubjectForm({ ...subjectForm, type: e.target.value })}
                    >
                      <option value="THEORY">Theory</option>
                      <option value="LABORATORY">Laboratory</option>
                    </select>
                  </div>
                </div>

                <div className="form-row three-cols">
                  <div className="form-group">
                    <label className="form-label">Credits:</label>
                    <input
                      type="number"
                      step="0.5"
                      min="0.5"
                      className="form-input"
                      value={subjectForm.credits}
                      onChange={(e) => setSubjectForm({ ...subjectForm, credits: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Internal Max:</label>
                    <input
                      type="number"
                      className="form-input"
                      value={subjectForm.internalMaxMarks}
                      onChange={(e) => setSubjectForm({ ...subjectForm, internalMaxMarks: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">External Max:</label>
                    <input
                      type="number"
                      className="form-input"
                      value={subjectForm.externalMaxMarks}
                      onChange={(e) => setSubjectForm({ ...subjectForm, externalMaxMarks: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="form-row two-cols">
                  <div className="form-group">
                    <label className="form-label">External Min Pass Marks:</label>
                    <input
                      type="number"
                      className="form-input"
                      value={subjectForm.externalMinPassMarks}
                      onChange={(e) => setSubjectForm({ ...subjectForm, externalMinPassMarks: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Total Min Pass Marks:</label>
                    <input
                      type="number"
                      className="form-input"
                      value={subjectForm.totalMinPassMarks}
                      onChange={(e) => setSubjectForm({ ...subjectForm, totalMinPassMarks: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <button type="submit" className="btn btn-primary" disabled={isCreatingSubject}>
                  {isCreatingSubject ? 'Saving Subject...' : '+ Create Subject'}
                </button>
              </form>
            </div>

            {/* Existing Subjects Table */}
            <div className="card table-card">
              <div className="card-header">
                <h2 className="card-title">Curriculum Subjects ({subjects.length})</h2>
              </div>
              <div className="table-responsive max-h-500">
                <table className="student-table">
                  <thead>
                    <tr>
                      <th>Code</th>
                      <th>Subject Name</th>
                      <th>Sem</th>
                      <th>Branch</th>
                      <th>Credits</th>
                      <th>Max Marks</th>
                      <th>Min Pass</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subjects.map((sub) => (
                      <tr key={sub.id}>
                        <td><span className="badge-code">{sub.code}</span></td>
                        <td>{sub.name}</td>
                        <td>Sem {sub.semester}</td>
                        <td>{sub.branch}</td>
                        <td className="font-bold">{sub.credits}</td>
                        <td>Int: {sub.internalMaxMarks} | Ext: {sub.externalMaxMarks}</td>
                        <td>Ext: {sub.externalMinPassMarks} | Tot: {sub.totalMinPassMarks}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Modal: Register Student */}
      {showRegisterModal && (
        <div className="modal-backdrop">
          <div className="modal-card wide-modal" role="dialog">
            <h3 className="modal-title">Register Approved Student Account</h3>
            <p className="modal-description">
              Registers student profile and establishes their authenticated college portal account.
            </p>

            <form onSubmit={handleRegisterSubmit} className="student-form">
              {regError && (
                <div className="alert-banner alert-danger">
                  <span>{regError}</span>
                </div>
              )}

              <div className="form-row two-cols">
                <div className="form-group text-left">
                  <label className="form-label">Roll Number / Enrollment ID <span className="req">*</span></label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. 21B91A0503"
                    value={regForm.rollNumber}
                    onChange={(e) => setRegForm({ ...regForm, rollNumber: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group text-left">
                  <label className="form-label">Student Full Name <span className="req">*</span></label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Samantha Rao"
                    value={regForm.name}
                    onChange={(e) => setRegForm({ ...regForm, name: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-row two-cols">
                <div className="form-group text-left">
                  <label className="form-label">College Email Address:</label>
                  <input
                    type="email"
                    className="form-input"
                    placeholder="student@college.edu"
                    value={regForm.email}
                    onChange={(e) => setRegForm({ ...regForm, email: e.target.value })}
                  />
                </div>

                <div className="form-group text-left">
                  <label className="form-label">Branch:</label>
                  <select
                    className="form-input"
                    value={regForm.branch}
                    onChange={(e) => setRegForm({ ...regForm, branch: e.target.value })}
                  >
                    <option value="CSE">CSE (Computer Science)</option>
                    <option value="ECE">ECE (Electronics & Comm)</option>
                    <option value="EEE">EEE (Electrical & Electronics)</option>
                    <option value="MECH">MECH (Mechanical Engineering)</option>
                    <option value="CIVIL">CIVIL (Civil Engineering)</option>
                  </select>
                </div>
              </div>

              <div className="form-row three-cols">
                <div className="form-group text-left">
                  <label className="form-label">Academic Batch:</label>
                  <input
                    type="text"
                    className="form-input"
                    value={regForm.academicYear}
                    onChange={(e) => setRegForm({ ...regForm, academicYear: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group text-left">
                  <label className="form-label">Current Semester:</label>
                  <select
                    className="form-input"
                    value={regForm.currentSemester}
                    onChange={(e) => setRegForm({ ...regForm, currentSemester: Number(e.target.value) })}
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                      <option key={n} value={n}>Semester {n}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group text-left">
                  <label className="form-label">Section:</label>
                  <input
                    type="text"
                    className="form-input"
                    value={regForm.section}
                    onChange={(e) => setRegForm({ ...regForm, section: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group text-left">
                <label className="form-label">Initial Password:</label>
                <input
                  type="text"
                  className="form-input"
                  value={regForm.initialPassword}
                  onChange={(e) => setRegForm({ ...regForm, initialPassword: e.target.value })}
                />
                <small className="form-help">Default: <code>Student@123</code>. Student can change it upon logging in.</small>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowRegisterModal(false)}
                  disabled={isRegistering}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isRegistering}
                >
                  {isRegistering ? 'Registering...' : 'Register Student'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: View Academic Transcript */}
      {showTranscriptModal && selectedStudentReport && (
        <div className="modal-backdrop">
          <div className="modal-card transcript-modal" role="dialog">
            <h3 className="modal-title">
              Official Transcript: {selectedStudentReport.name} ({selectedStudentReport.rollNumber})
            </h3>
            <p className="modal-description">
              Branch: {selectedStudentReport.branch} | Cumulative CGPA: <strong>{Number(selectedStudentReport.cgpa).toFixed(2)}</strong> | Total Credits: <strong>{selectedStudentReport.totalCreditsEarned} / {selectedStudentReport.totalCreditsAttempted}</strong>
            </p>

            <div className="modal-body-scroll text-left">
              {selectedStudentReport.semesters && selectedStudentReport.semesters.length > 0 ? (
                selectedStudentReport.semesters.map((sem) => (
                  <div key={sem.semester} className="transcript-sem-section">
                    <div className="transcript-sem-header">
                      <h4>Semester {sem.semester} (SGPA: {Number(sem.sgpa).toFixed(2)} • Result: {sem.status})</h4>
                      <span className={`status-pill-sub ${sem.published ? 'pass' : 'fail'}`}>
                        {sem.published ? 'PUBLISHED' : 'DRAFT (UNPUBLISHED)'}
                      </span>
                    </div>

                    <table className="student-table mini-table">
                      <thead>
                        <tr>
                          <th>Subject</th>
                          <th>Credits</th>
                          <th>Internal</th>
                          <th>External</th>
                          <th>Total</th>
                          <th>Grade</th>
                          <th>Points</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sem.subjects.map((sub) => (
                          <tr key={sub.id || sub.subjectCode}>
                            <td>{sub.subjectCode} - {sub.subjectName}</td>
                            <td>{sub.credits}</td>
                            <td>{sub.internalMarks}</td>
                            <td>{sub.externalMarks}</td>
                            <td>{sub.totalMarks}</td>
                            <td><strong>{sub.grade}</strong></td>
                            <td>{sub.gradePoints}</td>
                            <td>
                              <span className={`status-pill-sub ${sub.status === 'PASS' ? 'pass' : 'fail'}`}>
                                {sub.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ))
              ) : (
                <p className="text-muted">No semester records recorded yet for this student.</p>
              )}
            </div>

            <div className="modal-actions">
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => setShowTranscriptModal(false)}
              >
                Close Transcript
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Reset Student Password */}
      {showResetPassModal && selectedStudentForPass && (
        <div className="modal-backdrop">
          <div className="modal-card" role="dialog">
            <h3 className="modal-title">Reset Password: {selectedStudentForPass.rollNumber}</h3>
            <p className="modal-description">
              Set a temporary password for <strong>{selectedStudentForPass.name}</strong>.
            </p>

            <form onSubmit={handleResetPassword} className="student-form">
              <div className="form-group text-left">
                <label className="form-label">New Password:</label>
                <input
                  type="text"
                  className="form-input"
                  value={newPasswordInput}
                  onChange={(e) => setNewPasswordInput(e.target.value)}
                  required
                />
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowResetPassModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Confirm Password Reset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
