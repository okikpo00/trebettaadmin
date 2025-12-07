import React from "react";
import "../css/ConfirmModal.css";

export default function ConfirmModal({ title, message, onConfirm, onCancel }) {
  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <h3 className="modal-title">{title}</h3>
        <p className="modal-message">{message}</p>

        <div className="modal-actions">
          <button className="btn cancel" onClick={onCancel}>
            Cancel
          </button>
          <button className="btn confirm" onClick={onConfirm}>
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
