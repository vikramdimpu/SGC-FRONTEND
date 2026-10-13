import React from 'react';

export default function DeleteModal({ student, onConfirm, onCancel, isDeleting }) {
  if (!student) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal-card" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <div className="modal-icon-danger">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6"/>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
            <line x1="10" y1="11" x2="10" y2="17"/>
            <line x1="14" y1="11" x2="14" y2="17"/>
          </svg>
        </div>

        <h3 id="modal-title" className="modal-title">Delete Student Record</h3>
        <p className="modal-description">
          Are you sure you want to permanently delete student{' '}
          <strong>{student.name}</strong> (Roll No: <code>{student.rollNumber}</code>)?
          <br />
          This will delete the record from the MySQL database.
        </p>

        <div className="modal-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onCancel}
            disabled={isDeleting}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-danger"
            onClick={() => onConfirm(student.id)}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <span className="spinner-sm"></span>
                <span>Deleting...</span>
              </>
            ) : (
              'Yes, Delete Record'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
