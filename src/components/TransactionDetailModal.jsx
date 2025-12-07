import React, { useState } from "react";
import api from "../api";
import ConfirmModal from "./ConfirmModal";
import "../css/Transactions.css";

export default function TransactionDetailModal({ tx, onClose, onUpdated }) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [actionType, setActionType] = useState(null);

  const doAction = async () => {
    try {
      if (actionType === "verify") {
        await api.post(`/admin/transactions/verify/${tx.reference}`);
        alert("Verified");
      } else if (actionType === "reverse") {
        await api.post(`/admin/transactions/reverse/${tx.id}`, { reason: "Admin reversal" });
        alert("Reversed");
      }
      setConfirmOpen(false);
      if (onUpdated) onUpdated();
      onClose();
    } catch (err) {
      console.error("tx modal action err", err);
      alert(err.response?.data?.message || "Action failed");
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card lg">
        <h3>Transaction {tx.reference}</h3>
        <div className="two-col">
          <div>
            <p className="muted small">Type</p>
            <div>{tx.type}</div>
            <p className="muted small mt">Status</p>
            <div><span className={`badge ${tx.status==="completed"?"success":tx.status==="pending"?"warn":"danger"}`}>{tx.status}</span></div>
          </div>
          <div>
            <p className="muted small">Amount</p>
            <h2>₦{Number(tx.amount || 0).toLocaleString()}</h2>
            <p className="muted small">User</p>
            <div>{tx.username || tx.email || tx.user_id}</div>
          </div>
        </div>

        <div className="meta">
          <p className="muted small">Reference: {tx.reference}</p>
          <p className="muted small">Created: {new Date(tx.created_at).toLocaleString()}</p>
          <p className="muted small">Balance before: ₦{Number(tx.balance_before || 0).toLocaleString()}</p>
          <p className="muted small">Balance after: ₦{Number(tx.balance_after || 0).toLocaleString()}</p>
        </div>

        <div className="modal-actions">
          <button className="btn ghost" onClick={onClose}>Close</button>
          {tx.status !== "completed" && <button className="btn" onClick={() => { setActionType("verify"); setConfirmOpen(true); }}>Verify</button>}
          {tx.status === "completed" && <button className="btn warn" onClick={() => { setActionType("reverse"); setConfirmOpen(true); }}>Reverse</button>}
        </div>
      </div>

      {confirmOpen && (
        <ConfirmModal
          title={actionType === "verify" ? "Confirm Verify" : "Confirm Reverse"}
          message={actionType === "verify" ? `Verify ${tx.reference}?` : `Reverse ${tx.reference}? This will create a reversal.`}
          onCancel={() => setConfirmOpen(false)}
          onConfirm={doAction}
        />
      )}
    </div>
  );
}
