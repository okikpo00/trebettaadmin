import React, { useEffect, useState } from "react";
import api from "../api";
import "../css/Modals.css";
import { format } from "date-fns";

export default function RolloverInfoModal({ onClose }) {
  const [balance, setBalance] = useState(0);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const balRes = await api.get("/admin/rollover");
      const histRes = await api.get("/admin/rollover/history");

      // FIX: match backend response exactly
      setBalance(balRes.data?.balance?.amount ?? 0);
      setHistory(histRes.data?.data ?? []);
    } catch (err) {
      console.error("rollover fetch err", err);
      alert(err.response?.data?.message || "Failed to load rollover info");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="modal-overlay">
      <div className="modal-card full">
        
        {/* Header */}
        <div className="modal-header-row">
          <h3>Rollover Balance & History</h3>
          <button className="btn ghost" onClick={onClose}>Close</button>
        </div>

        {/* Balance Card */}
        <div className="balance-card">
          <h2 className="big-balance">₦{Number(balance).toLocaleString()}</h2>
          <p className="muted">Available rollover balance</p>
        </div>

        {/* History Section */}
        <h4 style={{ marginTop: "20px" }}>Rollover History</h4>

        <div className="table-wrap">
          {loading ? (
            <div className="muted">Loading...</div>
          ) : history.length === 0 ? (
            <div className="muted">No rollover history found</div>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Pool</th>
                  <th>Amount</th>
                  <th>Admin</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {history.map((h) => (
                  <tr key={h.id}>
                    <td>{h.id}</td>
                    <td>Pool #{h.pool_id}</td>
                    <td>₦{Number(h.amount).toLocaleString()}</td>

                    {/* FIX: admin_id is the correct field */}
                    <td>{h.admin_id ? "Admin #" + h.admin_id : "Admin"}</td>

                    {/* FIX: created_at is the correct date field */}
                    <td>
                      {h.created_at 
                        ? format(new Date(h.created_at), "PP p") 
                        : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

      </div>
    </div>
  );
}
