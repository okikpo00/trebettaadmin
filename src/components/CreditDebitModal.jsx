import React, { useState } from "react";
import api from "../api";
import "../css/Wallets.css";

export default function CreditDebitModal({ user = {}, mode = "credit", onClose }) {
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    const numeric = Number(amount);
    if (!numeric || numeric <= 0) return alert("Enter a valid amount");
    setLoading(true);
    try {
      const path = mode === "credit" ? `/admin/wallets/credit/${user.user_id || user.id}` : `/admin/wallets/debit/${user.user_id || user.id}`;
      const body = { amount: numeric, reason };
      await api.post(path, body);
      alert(`Wallet ${mode === "credit" ? "credited" : "debited"} successfully`);
      onClose();
    } catch (err) {
      console.error("credit/debit err", err);
      alert(err.response?.data?.message || "Action failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card small">
        <h3>{mode === "credit" ? "Credit Wallet" : "Debit Wallet"}</h3>
        <p className="muted small">User: {user.username || user.email || user.user_id}</p>
        <input className="input" placeholder="Amount" value={amount} onChange={(e) => setAmount(e.target.value)} />
        <input className="input" placeholder="Reason (optional)" value={reason} onChange={(e) => setReason(e.target.value)} />
        <div className="modal-actions">
          <button className="btn cancel" onClick={onClose} disabled={loading}>Cancel</button>
          <button className="btn confirm" onClick={submit} disabled={loading}>{loading ? "Processing..." : (mode === "credit" ? "Credit" : "Debit")}</button>
        </div>
      </div>
    </div>
  );
}
