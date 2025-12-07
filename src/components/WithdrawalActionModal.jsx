// src/components/WithdrawalActionModal.jsx
import React, { useState } from "react";
import api from "../api";
import "../css/Modals.css";

export default function WithdrawalActionModal({ data, onClose }) {
  const [loading, setLoading] = useState(false);
  const [reason, setReason] = useState("");

  const approve = async () => {
    if (!window.confirm("Approve this withdrawal?")) return;
    setLoading(true);
    try {
      await api.post(`/admin/withdrawals/${data.id}/approve`, { note: null });
      alert("Withdrawal approved");
      onClose();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Approve failed");
    } finally { setLoading(false); }
  };

  const reject = async () => {
    if (!reason.trim()) return alert("Provide a reason");
    setLoading(true);
    try {
      await api.patch(`/admin/withdrawals/${data.id}/reject`, { reason: reason.trim() });
      alert("Withdrawal rejected");
      onClose();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Reject failed");
    } finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card wide">
        <button className="modal-close" onClick={onClose}>×</button>
        <h3 className="modal-title">Withdrawal — {data.username || data.user_id}</h3>
        <div className="modal-body split">
          <div className="left">
            <table className="meta-table">
              <tbody>
                <tr><td>Amount</td><td>₦{Number(data.amount).toLocaleString()}</td></tr>
                <tr><td>Bank</td><td>{data.bank_name}</td></tr>
                <tr><td>Account</td><td>{data.account_number}</td></tr>
                <tr><td>Auto Withdraw</td><td>{data.auto_withdraw ? "Yes" : "No"}</td></tr>
                <tr><td>Requested</td><td>{new Date(data.created_at).toLocaleString()}</td></tr>
              </tbody>
            </table>
          </div>

          <div className="right">
            <div>
              <button className="btn primary" onClick={approve} disabled={loading}>{loading ? "Working..." : "Approve"}</button>
              <div style={{height:8}} />
              <textarea className="input" placeholder="Reason for rejection" value={reason} onChange={(e)=>setReason(e.target.value)} />
              <div style={{height:8}} />
              <button className="btn danger" onClick={reject} disabled={loading}>{loading ? "Working..." : "Reject"}</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
