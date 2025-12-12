import React, { useState } from "react";
import api from "../api";
import "../css/Deposits.css";

export default function ManualDepositModal({ onClose, onSuccess }) {
  const [userId, setUserId] = useState("");
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!userId || !amount) return alert("User ID and amount are required");

    setLoading(true);
    try {
      const res = await api.post("/admin/deposits/manual", {
        user_id: Number(userId),
        amount: Number(amount),
        reason: reason || "Manual deposit",
      });

      alert(res.data?.message || "Manual deposit successful");
      onSuccess();
    } catch (err) {
      console.error("manual deposit error:", err);
      alert(err.response?.data?.message || "Manual deposit failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <h3>Manual Deposit</h3>

        <div className="form-row">
          <label>User ID</label>
          <input
            className="input"
            type="number"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            placeholder="Enter user ID"
          />
        </div>

        <div className="form-row">
          <label>Amount (₦)</label>
          <input
            className="input"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount"
          />
        </div>

        <div className="form-row">
          <label>Reason (optional)</label>
          <textarea
            className="input"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Why are you crediting this user?"
          />
        </div>

        <div className="modal-actions">
          <button className="btn ghost" onClick={onClose}>Cancel</button>
          <button className="btn primary" disabled={loading} onClick={handleSubmit}>
            {loading ? "Processing..." : "Confirm Deposit"}
          </button>
        </div>
      </div>
    </div>
  );
}
