// src/components/DepositFormModal.jsx
import React, { useState } from "react";
import api from "../api";
import "../css/Modals.css";

export default function DepositFormModal({ onClose }) {
  const [userId, setUserId] = useState("");
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userId || !amount) {
      alert("User ID and amount are required");
      return;
    }

    setLoading(true);
    try {
      await api.post("/admin/deposits/manual", {
        user_id: userId,
        amount,
        reason,
      });

      alert("Manual deposit successful");
      onClose && onClose();
    } catch (err) {
      console.error("manual deposit err:", err);
      alert(err.response?.data?.message || "Failed to process manual deposit");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <h3>Manual Deposit</h3>
        <p className="muted small">
          Credit a user’s wallet manually. Use this only for verified cases.
        </p>

        <form onSubmit={handleSubmit} className="modal-form">
          <label className="field">
            <span>User ID</span>
            <input
              className="input"
              type="number"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="e.g. 102"
            />
          </label>

          <label className="field">
            <span>Amount (NGN)</span>
            <input
              className="input"
              type="number"
              min="0"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="e.g. 5000"
            />
          </label>

          <label className="field">
            <span>Reason (optional)</span>
            <textarea
              className="input textarea"
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Reason for manual credit"
            />
          </label>

          <div className="modal-actions">
            <button
              type="button"
              className="btn ghost"
              onClick={() => !loading && onClose && onClose()}
            >
              Cancel
            </button>
            <button type="submit" className="btn primary" disabled={loading}>
              {loading ? "Processing..." : "Confirm Deposit"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
