// src/components/ConfirmActionModal.jsx
import React from "react";
import "../css/Modals.css";

export default function ConfirmActionModal({ title, message, onCancel, onConfirm, danger = false }) {
  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <h3>{title}</h3>
        <p className="muted">{message}</p>

        <div className="modal-actions">
          <button className="btn ghost" onClick={onCancel}>Cancel</button>
          <button className={`btn ${danger ? "danger" : "primary"}`} onClick={onConfirm}>Confirm</button>
        </div>
      </div>
    </div>
  );
}
