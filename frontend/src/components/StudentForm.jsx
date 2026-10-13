import React, { useState, useEffect } from 'react';

const initialFormData = {
  name: '',
  rollNumber: '',
  subject1: '',
  subject2: '',
  subject3: '',
  subject4: '',
  subject5: '',
};

export default function StudentForm({
  onSubmit,
  editingStudent,
  onCancelEdit,
  isSubmitting,
  serverValidationErrors = {},
}) {
  const [formData, setFormData] = useState(initialFormData);
  const [clientErrors, setClientErrors] = useState({});

  useEffect(() => {
    if (editingStudent) {
      setFormData({
        name: editingStudent.name || '',
        rollNumber: editingStudent.rollNumber || '',
        subject1: editingStudent.subject1 !== undefined ? editingStudent.subject1 : '',
        subject2: editingStudent.subject2 !== undefined ? editingStudent.subject2 : '',
        subject3: editingStudent.subject3 !== undefined ? editingStudent.subject3 : '',
        subject4: editingStudent.subject4 !== undefined ? editingStudent.subject4 : '',
        subject5: editingStudent.subject5 !== undefined ? editingStudent.subject5 : '',
      });
      setClientErrors({});
    } else {
      setFormData(initialFormData);
      setClientErrors({});
    }
  }, [editingStudent]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (clientErrors[name]) {
      setClientErrors((prev) => ({
        ...prev,
        [name]: null,
      }));
    }
  };

  // Real-time dynamic grade preview calculation
  const calculateLivePreview = () => {
    const s1 = parseFloat(formData.subject1);
    const s2 = parseFloat(formData.subject2);
    const s3 = parseFloat(formData.subject3);
    const s4 = parseFloat(formData.subject4);
    const s5 = parseFloat(formData.subject5);

    const hasMarks = [s1, s2, s3, s4, s5].every((val) => !isNaN(val) && val >= 0 && val <= 100);

    if (!hasMarks) {
      return null;
    }

    const total = s1 + s2 + s3 + s4 + s5;
    const rawPct = (total / 500) * 100;
    const percentage = Math.round(rawPct * 100) / 100;

    let grade = 'F';
    if (percentage >= 90) grade = 'A';
    else if (percentage >= 75) grade = 'B';
    else if (percentage >= 60) grade = 'C';
    else if (percentage >= 40) grade = 'D';

    const status = grade === 'F' ? 'FAIL' : 'PASS';

    return { total, percentage, grade, status };
  };

  const preview = calculateLivePreview();

  const validateForm = () => {
    const errors = {};

    if (!formData.name.trim()) {
      errors.name = 'Student name is required';
    } else if (formData.name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters';
    }

    if (!formData.rollNumber.trim()) {
      errors.rollNumber = 'Roll number is required';
    }

    const subjects = [
      { key: 'subject1', label: 'Mathematics' },
      { key: 'subject2', label: 'Science' },
      { key: 'subject3', label: 'English' },
      { key: 'subject4', label: 'Social Studies' },
      { key: 'subject5', label: 'Computer Science' },
    ];

    subjects.forEach(({ key, label }) => {
      const val = formData[key];
      if (val === '' || val === null || val === undefined) {
        errors[key] = `${label} mark is required`;
      } else {
        const num = Number(val);
        if (isNaN(num)) {
          errors[key] = `${label} mark must be a valid number`;
        } else if (num < 0 || num > 100) {
          errors[key] = `${label} mark must be between 0 and 100`;
        }
      }
    });

    setClientErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    const payload = {
      name: formData.name.trim(),
      rollNumber: formData.rollNumber.trim(),
      subject1: parseFloat(formData.subject1),
      subject2: parseFloat(formData.subject2),
      subject3: parseFloat(formData.subject3),
      subject4: parseFloat(formData.subject4),
      subject5: parseFloat(formData.subject5),
    };

    onSubmit(payload);
  };

  const handleReset = () => {
    setFormData(initialFormData);
    setClientErrors({});
    if (editingStudent && onCancelEdit) {
      onCancelEdit();
    }
  };

  const getFieldError = (fieldName) => {
    return clientErrors[fieldName] || serverValidationErrors[fieldName];
  };

  return (
    <div className="card form-card">
      <div className="card-header">
        <div className="card-title-group">
          <span className="card-badge">{editingStudent ? 'Editing Record' : 'Data Entry'}</span>
          <h2 className="card-title">
            {editingStudent ? `Update Student: ${editingStudent.name}` : 'Student Grade Calculator & Enrollment'}
          </h2>
          <p className="card-subtitle">
            Enter the student credentials and 5 subject scores (out of 100) to compute grades.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="student-form" noValidate>
        <div className="form-row two-cols">
          <div className="form-group">
            <label htmlFor="name" className="form-label">
              Student Full Name <span className="req">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. Alexander Fleming"
              className={`form-input ${getFieldError('name') ? 'input-error' : ''}`}
            />
            {getFieldError('name') && <span className="error-text">{getFieldError('name')}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="rollNumber" className="form-label">
              Roll / Reg. Number <span className="req">*</span>
            </label>
            <input
              type="text"
              id="rollNumber"
              name="rollNumber"
              value={formData.rollNumber}
              onChange={handleChange}
              placeholder="e.g. SGC-2026-101"
              className={`form-input ${getFieldError('rollNumber') ? 'input-error' : ''}`}
            />
            {getFieldError('rollNumber') && (
              <span className="error-text">{getFieldError('rollNumber')}</span>
            )}
          </div>
        </div>

        <div className="subject-section">
          <h3 className="section-title">Academic Subject Scores (Max: 100 each)</h3>
          <div className="form-row five-cols">
            <div className="form-group">
              <label htmlFor="subject1" className="form-label">
                Mathematics <span className="req">*</span>
              </label>
              <input
                type="number"
                id="subject1"
                name="subject1"
                min="0"
                max="100"
                step="0.5"
                value={formData.subject1}
                onChange={handleChange}
                placeholder="0-100"
                className={`form-input mark-input ${getFieldError('subject1') ? 'input-error' : ''}`}
              />
              {getFieldError('subject1') && (
                <span className="error-text">{getFieldError('subject1')}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="subject2" className="form-label">
                Science <span className="req">*</span>
              </label>
              <input
                type="number"
                id="subject2"
                name="subject2"
                min="0"
                max="100"
                step="0.5"
                value={formData.subject2}
                onChange={handleChange}
                placeholder="0-100"
                className={`form-input mark-input ${getFieldError('subject2') ? 'input-error' : ''}`}
              />
              {getFieldError('subject2') && (
                <span className="error-text">{getFieldError('subject2')}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="subject3" className="form-label">
                English <span className="req">*</span>
              </label>
              <input
                type="number"
                id="subject3"
                name="subject3"
                min="0"
                max="100"
                step="0.5"
                value={formData.subject3}
                onChange={handleChange}
                placeholder="0-100"
                className={`form-input mark-input ${getFieldError('subject3') ? 'input-error' : ''}`}
              />
              {getFieldError('subject3') && (
                <span className="error-text">{getFieldError('subject3')}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="subject4" className="form-label">
                Social Studies <span className="req">*</span>
              </label>
              <input
                type="number"
                id="subject4"
                name="subject4"
                min="0"
                max="100"
                step="0.5"
                value={formData.subject4}
                onChange={handleChange}
                placeholder="0-100"
                className={`form-input mark-input ${getFieldError('subject4') ? 'input-error' : ''}`}
              />
              {getFieldError('subject4') && (
                <span className="error-text">{getFieldError('subject4')}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="subject5" className="form-label">
                Computer Science <span className="req">*</span>
              </label>
              <input
                type="number"
                id="subject5"
                name="subject5"
                min="0"
                max="100"
                step="0.5"
                value={formData.subject5}
                onChange={handleChange}
                placeholder="0-100"
                className={`form-input mark-input ${getFieldError('subject5') ? 'input-error' : ''}`}
              />
              {getFieldError('subject5') && (
                <span className="error-text">{getFieldError('subject5')}</span>
              )}
            </div>
          </div>
        </div>

        {/* Dynamic Live Grade Preview Box */}
        {preview && (
          <div className={`preview-box grade-${preview.grade.toLowerCase()}`}>
            <div className="preview-header">
              <span className="preview-label">Live Calculation Preview:</span>
            </div>
            <div className="preview-stats">
              <div className="preview-item">
                <span>Total Marks:</span>
                <strong>{preview.total} / 500</strong>
              </div>
              <div className="preview-item">
                <span>Percentage:</span>
                <strong>{preview.percentage}%</strong>
              </div>
              <div className="preview-item">
                <span>Calculated Grade:</span>
                <span className={`grade-tag tag-${preview.grade.toLowerCase()}`}>
                  Grade {preview.grade}
                </span>
              </div>
              <div className="preview-item">
                <span>Result:</span>
                <span className={`status-tag tag-${preview.status.toLowerCase()}`}>
                  {preview.status}
                </span>
              </div>
            </div>
          </div>
        )}

        <div className="form-actions">
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span className="spinner-sm"></span>
                <span>Saving to Database...</span>
              </>
            ) : editingStudent ? (
              <>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                  <polyline points="17 21 17 13 7 13 7 21"/>
                  <polyline points="7 3 7 8 15 8"/>
                </svg>
                <span>Update Student Record</span>
              </>
            ) : (
              <>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19"/>
                  <line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                <span>Calculate & Enroll Student</span>
              </>
            )}
          </button>

          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleReset}
            disabled={isSubmitting}
          >
            {editingStudent ? 'Cancel Edit' : 'Clear Inputs'}
          </button>
        </div>
      </form>
    </div>
  );
}
