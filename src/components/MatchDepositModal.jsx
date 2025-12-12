// src/components/MatchDepositModal.jsx
import React from "react";
import "../css/Modals.css";

export default function MatchDepositModal({ deposit, onClose, onConfirm, loading }) {
  if (!deposit) return null;

  const expiresAt = deposit.expires_at ? new Date(deposit.expires_at).toLocaleString() : "—";
  const createdAt = deposit.created_at ? new Date(deposit.created_at).toLocaleString() : "—";

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <h3>Match Deposit</h3>
        <p className="muted small">
          Confirm that this bank transfer belongs to this user. This will credit their wallet and
          cannot be undone.
        </p>

        <div className="modal-section">
          <div className="modal-row">
            <span className="label">User</span>
            <span className="value">
              {deposit.username || "-"}{" "}
              <span className="muted tiny">{deposit.email || ""}</span>
            </span>
          </div>
          <div className="modal-row">
            <span className="label">Amount</span>
            <span className="value">
              ₦{Number(deposit.amount).toLocaleString()}
            </span>
          </div>
          <div className="modal-row">
            <span className="label">Reference</span>
            <span className="value muted small">{deposit.reference}</span>
          </div>
          <div className="modal-row">
            <span className="label">Created</span>
            <span className="value muted small">{createdAt}</span>
          </div>
          <div className="modal-row">
            <span className="label">Expires At</span>
            <span className="value muted small">{expiresAt}</span>
          </div>
        </div>

        <div className="modal-actions">
          <button className="btn ghost" onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button className="btn primary" onClick={onConfirm} disabled={loading}>
            {loading ? "Matching..." : "Confirm Match"}
          </button>
        </div>
      </div>
    </div>
  );
}
