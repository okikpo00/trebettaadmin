import React, { useEffect, useState } from "react";
import api from "../api";
import "../css/Deposits.css";
import ManualDepositModal from "../components/ManualDepositModal";

export default function ExpiredDeposits() {
  const [expired, setExpired] = useState([]);
  const [loading, setLoading] = useState(true);
  const [manualModalOpen, setManualModalOpen] = useState(false);

  // Set admin session header
  useEffect(() => {
    const sid = localStorage.getItem("admin_session_id");
    if (sid) api.defaults.headers.common["x-admin-session-id"] = sid;
  }, []);

  const fetchExpired = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/deposits/expired");
      setExpired(res.data?.data ?? []);
    } catch (err) {
      console.error("expired list error:", err);
      alert(err.response?.data?.message || "Failed to load expired deposits");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpired();
  }, []);

  return (
    <div className="deposits-page">
      <div className="deposits-header">
        <div>
          <h2>Expired Deposits</h2>
          <div className="deposits-subtitle">Deposits that expired before user confirmation</div>
        </div>

        <button
          className="manual-btn"
          onClick={() => setManualModalOpen(true)}
        >
          + Manual Deposit
        </button>
      </div>

      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>User</th>
              <th>Amount</th>
              <th>Reference</th>
              <th>Expired At</th>
              <th>Created</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr><td colSpan="6" className="td-center">Loading…</td></tr>
            ) : expired.length === 0 ? (
              <tr><td colSpan="6" className="td-center">No expired deposits found</td></tr>
            ) : (
              expired.map((d) => (
                <tr key={d.id}>
                  <td>{d.id}</td>

                  <td>
                    <strong>{d.username}</strong>
                    <div className="muted small">{d.email}</div>
                  </td>

                  <td>₦{Number(d.amount).toLocaleString()}</td>

                  <td className="small">{d.reference}</td>

                  <td className="small">
                    {new Date(d.expires_at).toLocaleString()}
                  </td>

                  <td className="small">
                    {new Date(d.created_at).toLocaleString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Manual Deposit Modal */}
      {manualModalOpen && (
        <ManualDepositModal
          onClose={() => setManualModalOpen(false)}
          onSuccess={() => {
            setManualModalOpen(false);
            fetchExpired();
          }}
        />
      )}
    </div>
  );
}
