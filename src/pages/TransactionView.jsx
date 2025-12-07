import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api";
import ConfirmModal from "../components/ConfirmModal";
import "../css/Transactions.css";

export default function TransactionView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tx, setTx] = useState(null);
  const [loading, setLoading] = useState(true);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [actionType, setActionType] = useState(null);

  const fetch = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/admin/transactions/${id}`);
      setTx(res.data.transaction || res.data);
    } catch (err) {
      console.error("get tx err", err);
      alert(err.response?.data?.message || "Failed to load transaction");
      navigate("/dashboard/transactions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetch(); }, [id]);

  const handleVerify = () => { setActionType("verify"); setConfirmOpen(true); };
  const handleReverse = () => { setActionType("reverse"); setConfirmOpen(true); };

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
      fetch();
    } catch (err) {
      console.error("tx action err", err);
      alert(err.response?.data?.message || "Action failed");
    }
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (!tx) return <div className="loading">Transaction not found</div>;

  return (
    <div className="admin-page container transaction-view">
      <div className="page-head">
        <h1>Transaction #{tx.id}</h1>
        <div className="head-right">
          <button className="btn ghost" onClick={() => navigate(-1)}>Back</button>
        </div>
      </div>

      <div className="card tx-summary">
        <div className="two-col">
          <div>
            <p className="muted">Reference</p>
            <h3>{tx.reference}</h3>
            <p className="muted small">Type: {tx.type}</p>
            <p className="muted small">Status: <span className={`badge ${tx.status==="completed"?"success": tx.status==="pending"?"warn":"danger"}`}>{tx.status}</span></p>
          </div>
          <div className="right-col">
            <h2>₦{Number(tx.amount || 0).toLocaleString()}</h2>
            <p className="muted small">User: {tx.username || tx.email || tx.user_id}</p>
            <div className="tx-actions">
              {tx.status !== "completed" && <button className="btn" onClick={handleVerify}>Verify</button>}
              {tx.status === "completed" && <button className="btn warn" onClick={handleReverse}>Reverse</button>}
            </div>
          </div>
        </div>

        <div className="meta">
          <p className="muted small">Balance Before: ₦{Number(tx.balance_before || 0).toLocaleString()}</p>
          <p className="muted small">Balance After: ₦{Number(tx.balance_after || 0).toLocaleString()}</p>
          <p className="muted small">Created: {new Date(tx.created_at).toLocaleString()}</p>
        </div>
      </div>

      {confirmOpen && (
        <ConfirmModal
          title={actionType === "verify" ? "Confirm Verify" : "Confirm Reverse"}
          message={actionType === "verify" ? `Verify ${tx.reference}?` : `Reverse ${tx.reference}? This is irreversible.`}
          onCancel={() => setConfirmOpen(false)}
          onConfirm={doAction}
        />
      )}
    </div>
  );
}
