import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api";
import Pagination from "../components/Pagination";
import ConfirmModal from "../components/ConfirmModal";
import CreditDebitModal from "../components/CreditDebitModal";
import TransactionDetailModal from "../components/TransactionDetailModal";
import "../css/Wallets.css";

export default function WalletView() {
  const { id } = useParams(); // wallet id
  const navigate = useNavigate();
  const [wallet, setWallet] = useState(null);
  const [txs, setTxs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCredit, setShowCredit] = useState(false);
  const [showDebit, setShowDebit] = useState(false);
  const [selectedTx, setSelectedTx] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmPayload, setConfirmPayload] = useState(null);

  const fetch = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/admin/wallets/${id}`);
      setWallet(res.data.wallet || res.data);
      setTxs(res.data.transactions || []);
    } catch (err) {
      console.error("get wallet err", err);
      alert(err.response?.data?.message || "Failed to load wallet");
      navigate("/dashboard/wallets");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetch(); }, [id]);

  const openFreeze = () => {
    setConfirmPayload({
      title: wallet?.status === "frozen" ? "Unfreeze Wallet" : "Freeze Wallet",
      message: `Are you sure you want to ${wallet?.status === "frozen" ? "unfreeze" : "freeze"} this wallet?`,
    });
    setConfirmOpen(true);
  };

  const doFreeze = async () => {
    try {
      const path = wallet.status === "frozen" ? `/admin/wallets/unfreeze/${wallet.user_id}` : `/admin/wallets/freeze/${wallet.user_id}`;
      await api.patch(path, { reason: "Admin action" });
      setConfirmOpen(false);
      fetch();
      alert("Wallet status updated");
    } catch (err) {
      console.error("freeze err", err);
      alert(err.response?.data?.message || "Action failed");
    }
  };

  const handleTxClick = (tx) => setSelectedTx(tx);

  return (
    <div className="admin-page container wallet-view">
      <div className="page-head">
        <h1>Wallet Details</h1>
        <div className="head-right">
          <button className="btn" onClick={() => navigate("/dashboard/wallets")}>Back</button>
        </div>
      </div>

      {loading ? <div className="loading">Loading...</div> : (
        <>
          <div className="card wallet-summary">
            <div className="left">
              <h2>{wallet.username || wallet.email || `User ${wallet.user_id}`}</h2>
              <div className="muted">Wallet ID: {wallet.id}</div>
              <div className="muted small">Currency: {wallet.currency || "NGN"}</div>
            </div>
            <div className="right">
              <div className="big-amount">₦{Number(wallet.balance || 0).toLocaleString()}</div>
              <div className="muted">Reserved: ₦{Number(wallet.reserved_balance || 0).toLocaleString()}</div>
              <div className="wallet-actions">
                <button className="btn" onClick={() => setShowCredit(true)}>Credit</button>
                <button className="btn warn" onClick={() => setShowDebit(true)}>Debit</button>
                <button className={`btn ghost`} onClick={openFreeze}>{wallet.status === "frozen" ? "Unfreeze" : "Freeze"}</button>
              </div>
            </div>
          </div>

          <div className="card transactions-card">
            <h3>Recent Transactions</h3>
            <div className="table-wrap">
              <table className="table">
                <thead><tr><th>Ref</th><th>Type</th><th>Amount</th><th>Status</th><th>Date</th><th></th></tr></thead>
                <tbody>
                  {txs.length === 0 ? <tr><td colSpan="6" className="td-center">No transactions</td></tr> :
                    txs.map(tx => (
                      <tr key={tx.id}>
                        <td className="muted small">{tx.reference || tx.id}</td>
                        <td>{tx.type}</td>
                        <td>₦{Number(tx.amount).toLocaleString()}</td>
                        <td><span className={`badge ${tx.status === "completed" ? "success" : tx.status === "pending" ? "warn" : "danger"}`}>{tx.status}</span></td>
                        <td className="muted small">{new Date(tx.created_at).toLocaleString()}</td>
                        <td><button className="action" onClick={() => handleTxClick(tx)}>View</button></td>
                      </tr>
                    ))
                  }
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {confirmOpen && (
        <ConfirmModal
          title={confirmPayload.title}
          message={confirmPayload.message}
          onCancel={() => setConfirmOpen(false)}
          onConfirm={doFreeze}
        />
      )}

      {showCredit && (
        <CreditDebitModal mode="credit" user={{ user_id: wallet.user_id }} onClose={() => { setShowCredit(false); fetch(); }} />
      )}
      {showDebit && (
        <CreditDebitModal mode="debit" user={{ user_id: wallet.user_id }} onClose={() => { setShowDebit(false); fetch(); }} />
      )}

      {selectedTx && (
        <TransactionDetailModal tx={selectedTx} onClose={() => setSelectedTx(null)} onUpdated={() => fetch()} />
      )}
    </div>
  );
}
