// src/pages/UserView.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api";
import "../css/UserView.css";
import Pagination from "../components/Pagination";
import ConfirmModal from "../components/ConfirmModal";

export default function UserView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [wallet, setWallet] = useState(null);
  const [kyc, setKyc] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [audit, setAudit] = useState([]);
  const [txPage, setTxPage] = useState(1);

  // simple confirm modal state for delete user
  const [confirmOpen, setConfirmOpen] = useState(false);

  const fetchDetails = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/admin/users/${id}`);
      const data = res.data || {};
      setUser(data.user || null);
      setWallet(data.wallet || null);
      setKyc(data.kyc || null);
      setTransactions(data.transactions || []);
      setAudit(data.audit || []);
    } catch (err) {
      console.error("user details err", err);
      alert(err.response?.data?.message || "Failed to load user details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDetails(); /* eslint-disable-line */ }, [id]);

  const handleDelete = async () => {
    try {
      await api.delete(`/admin/users/${id}`);
      alert("User blocked (soft deleted)");
      navigate("/dashboard/users");
    } catch (err) {
      console.error("delete err", err);
      alert(err.response?.data?.message || "Failed to delete user");
    }
  };

  const handleResetPassword = async () => {
    try {
      await api.patch(`/admin/users/reset-password/${id}`);
      alert("Password reset link sent to user email.");
    } catch (err) {
      console.error("reset err", err);
      alert(err.response?.data?.message || "Failed to send reset link");
    }
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (!user) return <div className="loading">User not found</div>;

  return (
    <div className="userview-page container">
      <div className="top-row">
        <div className="profile-card card">
          <div className="avatar">{(user.first_name && user.first_name[0]) || (user.username && user.username[0]) || "U"}</div>
          <div className="profile-body">
            <h2>{user.first_name ? `${user.first_name} ${user.last_name || ""}` : (user.username || "—")}</h2>
            <div className="muted small">{user.username}</div>
            <div className="contact muted">{user.email} • {user.phone || "—"}</div>

            <div className="meta-row">
              <span className={`badge ${user.status === "suspended" ? "danger" : user.status === "blocked" ? "dark" : "success"}`}>{user.status}</span>
              <span className={`badge ${user.kyc_status === "approved" ? "success" : user.kyc_status === "rejected" ? "danger" : "warn"}`}>{user.kyc_status || "none"}</span>
              <small className="muted level">{user.kyc_level ? `KYC Level ${user.kyc_level}` : ""}</small>
            </div>
          </div>
          <div className="profile-actions">
            <button className="btn ghost" onClick={() => navigate("/dashboard/users")}>Back</button>
            <button className="btn" onClick={handleResetPassword}>Reset Password</button>
            <button className="btn danger" onClick={() => setConfirmOpen(true)}>Block</button>
          </div>
        </div>

        <div className="wallet-card card">
          <div className="wallet-title">Wallet</div>
          <div className="wallet-balance">₦{Number(wallet?.balance ?? 0).toLocaleString()}</div>
          <div className="wallet-meta muted">Currency: {wallet?.currency || "NGN"}</div>
          <div className="wallet-actions">
            <button className="btn ghost" onClick={() => alert("Use admin wallet adjust flow (separate page)")}>View transactions</button>
          </div>
        </div>
      </div>

      <div className="content-grid">
        <div className="kyc-block card">
          <h3>KYC</h3>
          {kyc ? (
            <>
              <div><strong>Tier:</strong> {kyc.level || "—"}</div>
              <div><strong>Status:</strong> <span className={`badge ${kyc.status === "approved" ? "success" : kyc.status === "rejected" ? "danger" : "warn"}`}>{kyc.status}</span></div>
              <div className="kyc-docs">
                {kyc.id_image_url && <a href={kyc.id_image_url} target="_blank" rel="noreferrer"><img src={kyc.id_image_url} alt="id" /></a>}
                {kyc.selfie_url && <a href={kyc.selfie_url} target="_blank" rel="noreferrer"><img src={kyc.selfie_url} alt="selfie" /></a>}
                {kyc.address_proof_url && <a href={kyc.address_proof_url} target="_blank" rel="noreferrer"><img src={kyc.address_proof_url} alt="address" /></a>}
              </div>
            </>
          ) : (
            <div className="muted">No KYC submitted</div>
          )}
        </div>

        <div className="txs-block card">
          <h3>Recent Transactions</h3>
          {transactions.length === 0 ? <div className="muted">No transactions</div> : (
            <table className="table small">
              <thead>
                <tr><th>ID</th><th>Type</th><th>Amount</th><th>Status</th><th>Date</th></tr>
              </thead>
              <tbody>
                {transactions.map(t => (
                  <tr key={t.id}>
                    <td className="mono">{t.id}</td>
                    <td>{t.type}</td>
                    <td>₦{Number(t.amount).toLocaleString()}</td>
                    <td><span className={`badge ${t.status === "completed" ? "success" : t.status === "pending" ? "warn" : "danger"}`}>{t.status}</span></td>
                    <td className="muted small">{new Date(t.created_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="audit-block card">
          <h3>Audit / Activity</h3>
          {audit.length === 0 ? <div className="muted">No audit records</div> : (
            <ul className="audit-list">
              {audit.map((a, idx) => (
                <li key={idx}>
                  <div className="muted small">{new Date(a.created_at).toLocaleString()}</div>
                  <div><strong>{a.action}</strong> — <span className="muted small">{a.entity}</span></div>
                  <div className="muted">{a.metadata ? JSON.stringify(a.metadata) : ""}</div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Confirm block modal */}
      {confirmOpen && (
        <ConfirmModal
          title="Block user"
          message="Are you sure you want to block (soft delete) this user? This will deactivate the account."
          onCancel={() => setConfirmOpen(false)}
          onConfirm={handleDelete}
        />
      )}
    </div>
  );
}
