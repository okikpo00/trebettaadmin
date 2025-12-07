// src/components/AdjustWalletModal.jsx
import React, { useState } from "react";
import api from "../api";
import "../css/Users.css";

export default function AdjustWalletModal({ open, onClose, userId }) {
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("admin_credit");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const submit = async () => {
    if (!amount || isNaN(Number(amount))) return alert("Enter a valid amount");
    setLoading(true);
    try {
      await api.post(`/admin/users/${userId}/wallet/adjust`, { amount: Number(amount), type, reason });
      alert("Wallet adjusted");
      onClose();
    } catch (err) {
      console.error("adjust err", err);
      alert(err.response?.data?.error || "Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-card">
        <h3>Adjust Wallet</h3>
        <div className="form-row">
          <label>Type</label>
          <select value={type} onChange={(e)=>setType(e.target.value)} className="select">
            <option value="admin_credit">Credit</option>
            <option value="withdrawal">Debit</option>
            <option value="transfer">Transfer</option>
            <option value="deposit">Deposit</option>
          </select>
        </div>
        <div className="form-row">
          <label>Amount</label>
          <input className="input" value={amount} onChange={(e)=>setAmount(e.target.value)} />
        </div>
        <div className="form-row">
          <label>Reason</label>
          <input className="input" value={reason} onChange={(e)=>setReason(e.target.value)} />
        </div>

        <div className="modal-actions">
          <button className="btn ghost" onClick={onClose} disabled={loading}>Cancel</button>
          <button className="btn primary" onClick={submit} disabled={loading}>{loading ? "Working..." : "Submit"}</button>
        </div>
      </div>
    </div>
  );
}
