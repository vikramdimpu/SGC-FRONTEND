import React, { useState } from 'react';

export default function StudentTable({
  students = [],
  isLoading,
  onEdit,
  onDeleteRequest,
  onRefresh,
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [gradeFilter, setGradeFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Filter students based on search term, grade, and status
  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.rollNumber?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesGrade = gradeFilter === 'ALL' || student.grade === gradeFilter;
    const matchesStatus = statusFilter === 'ALL' || student.status === statusFilter;

    return matchesSearch && matchesGrade && matchesStatus;
  });

  const getGradeBadgeClass = (grade) => {
    switch (grade) {
      case 'A':
        return 'grade-badge badge-a';
      case 'B':
        return 'grade-badge badge-b';
      case 'C':
        return 'grade-badge badge-c';
      case 'D':
        return 'grade-badge badge-d';
      case 'F':
      default:
        return 'grade-badge badge-f';
    }
  };

  const getStatusBadgeClass = (status) => {
    return status === 'PASS' ? 'status-badge status-pass' : 'status-badge status-fail';
  };

  return (
    <div className="card table-card">
      <div className="table-header-bar">
        <div className="table-title-area">
          <h2 className="card-title">Student Academic Records</h2>
          <p className="card-subtitle">
            Showing {filteredStudents.length} of {students.length} recorded students
          </p>
        </div>

        <button
          type="button"
          className="btn btn-outline"
          onClick={onRefresh}
          title="Refresh Table Data"
          disabled={isLoading}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={isLoading ? 'spinning' : ''}>
            <polyline points="23 4 23 10 17 10"/>
            <polyline points="1 20 1 14 7 14"/>
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
          </svg>
          <span>Refresh</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="filter-bar">
        <div className="search-box">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="search-icon">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            type="text"
            className="search-input"
            placeholder="Search by student name or roll number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button className="clear-search-btn" onClick={() => setSearchTerm('')}>
              ✕
            </button>
          )}
        </div>

        <div className="filter-selects">
          <select
            className="filter-select"
            value={gradeFilter}
            onChange={(e) => setGradeFilter(e.target.value)}
            aria-label="Filter by Grade"
          >
            <option value="ALL">All Grades (A-F)</option>
            <option value="A">Grade A (≥90%)</option>
            <option value="B">Grade B (75-89%)</option>
            <option value="C">Grade C (60-74%)</option>
            <option value="D">Grade D (40-59%)</option>
            <option value="F">Grade F (&lt;40%)</option>
          </select>

          <select
            className="filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            aria-label="Filter by Status"
          >
            <option value="ALL">All Statuses</option>
            <option value="PASS">Passed Only</option>
            <option value="FAIL">Failed Only</option>
          </select>
        </div>
      </div>

      {/* Table Container */}
      <div className="table-responsive">
        {isLoading ? (
          <div className="table-state-loading">
            <div className="spinner-lg"></div>
            <p>Fetching student records from Spring Boot backend...</p>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="table-state-empty">
            <div className="empty-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
                <polyline points="10 9 9 9 8 9"/>
              </svg>
            </div>
            <h3>No Student Records Found</h3>
            <p>
              {students.length === 0
                ? 'No students have been added yet. Use the form above to calculate grades and enroll students.'
                : 'No students match your active search or filter criteria. Try clearing the filters.'}
            </p>
          </div>
        ) : (
          <table className="student-table">
            <thead>
              <tr>
                <th>Roll No</th>
                <th>Student Name</th>
                <th>Subject Marks (Math • Sci • Eng • Soc • CS)</th>
                <th>Total / 500</th>
                <th>Percentage</th>
                <th>Grade</th>
                <th>Status</th>
                <th className="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((student) => (
                <tr key={student.id} className="table-row">
                  <td className="cell-roll">
                    <span className="roll-badge">{student.rollNumber}</span>
                  </td>
                  <td className="cell-name">
                    <strong>{student.name}</strong>
                  </td>
                  <td className="cell-subjects">
                    <div className="marks-pill-group">
                      <span className="mark-chip" title="Mathematics">M: {student.subject1}</span>
                      <span className="mark-chip" title="Science">S: {student.subject2}</span>
                      <span className="mark-chip" title="English">E: {student.subject3}</span>
                      <span className="mark-chip" title="Social Studies">SS: {student.subject4}</span>
                      <span className="mark-chip" title="Computer Science">CS: {student.subject5}</span>
                    </div>
                  </td>
                  <td className="cell-total">
                    <span className="total-highlight">{student.totalMarks}</span>
                    <span className="total-denom">/ 500</span>
                  </td>
                  <td className="cell-percentage">
                    <strong>{Number(student.percentage).toFixed(2)}%</strong>
                  </td>
                  <td className="cell-grade">
                    <span className={getGradeBadgeClass(student.grade)}>
                      {student.grade}
                    </span>
                  </td>
                  <td className="cell-status">
                    <span className={getStatusBadgeClass(student.status)}>
                      {student.status}
                    </span>
                  </td>
                  <td className="cell-actions text-center">
                    <div className="action-btn-group">
                      <button
                        type="button"
                        className="btn-action btn-edit"
                        title="Edit Student"
                        onClick={() => onEdit(student)}
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                        <span>Edit</span>
                      </button>

                      <button
                        type="button"
                        className="btn-action btn-delete"
                        title="Delete Student"
                        onClick={() => onDeleteRequest(student)}
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6"/>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                          <line x1="10" y1="11" x2="10" y2="17"/>
                          <line x1="14" y1="11" x2="14" y2="17"/>
                        </svg>
                        <span>Delete</span>
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
  );
}
