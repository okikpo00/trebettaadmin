import React, { useEffect, useState } from "react";

import "../css/WinnerTicker.css";
import api from "../api";

export default function WinnerTicker() {
  const [winners, setWinners] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ user_id: "", pool_id: "", amount: "", message: "" });
  const [page, setPage] = useState(1);
  const [toast, setToast] = useState(null);

  const fetchWinners = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/admin/winner-ticker?page=${page}&limit=20`);
      setWinners(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!form.user_id || !form.pool_id || !form.amount) {
      return showToast("All fields except message are required", "error");
    }
    try {
      await api.post("/admin/winner-ticker", form);
      showToast("Winner added successfully", "success");
      setModalOpen(false);
      fetchWinners();
    } catch (err) {
      console.error(err);
      showToast("Error adding winner", "error");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this winner?")) return;
    try {
      await api.delete(`/admin/winner-ticker/${id}`);
      showToast("Deleted successfully", "success");
      fetchWinners();
    } catch (err) {
      console.error(err);
      showToast("Delete failed", "error");
    }
  };

  const showToast = (msg, type = "info") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2500);
  };

  useEffect(() => {
    fetchWinners();
    const interval = setInterval(fetchWinners, 60000);
    return () => clearInterval(interval);
  }, [page]);

  return (
   
      <div className="winner-page">
        <div className="winner-header">
          <h2>🏆 Winner Ticker</h2>
          <div>
            <button className="btn-outline" onClick={() => fetchWinners()}>🔄 Reload</button>
            <button className="btn-primary" onClick={() => setModalOpen(true)}>+ Add Winner</button>
          </div>
        </div>

        {loading ? (
          <div className="loading">Loading...</div>
        ) : winners.length === 0 ? (
          <div className="no-data">No winners yet</div>
        ) : (
          <div className="table-wrapper">
            <table className="winner-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>User</th>
                  <th>Pool</th>
                  <th>Amount</th>
                  <th>Source</th>
                  <th>Message</th>
                  <th>Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {winners.map((w) => (
                  <tr key={w.id}>
                    <td>{w.id}</td>
                    <td>{w.username || `User #${w.user_id}`}</td>
                    <td>{w.pool_title || `Pool #${w.pool_id}`}</td>
                    <td>₦{Number(w.amount).toLocaleString()}</td>
                    <td>
                      <span className={`source-badge ${w.source}`}>{w.source}</span>
                    </td>
                    <td>{w.message || "-"}</td>
                    <td>{new Date(w.created_at).toLocaleString()}</td>
                    <td>
                      <button className="btn-delete" onClick={() => handleDelete(w.id)}>🗑️</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="pagination">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))}>⬅ Prev</button>
          <span>Page {page}</span>
          <button onClick={() => setPage((p) => p + 1)}>Next ➡</button>
        </div>

        {modalOpen && (
          <div className="modal-overlay">
            <div className="modal">
              <h3>Add Winner</h3>
              <div className="form-group">
                <label>User ID</label>
                <input
                  type="number"
                  value={form.user_id}
                  onChange={(e) => setForm({ ...form, user_id: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Pool ID</label>
                <input
                  type="number"
                  value={form.pool_id}
                  onChange={(e) => setForm({ ...form, pool_id: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Amount Won (₦)</label>
                <input
                  type="number"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Message (optional)</label>
                <input
                  type="text"
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                />
              </div>

              <div className="modal-actions">
                <button className="btn-outline" onClick={() => setModalOpen(false)}>Cancel</button>
                <button className="btn-primary" onClick={handleAdd}>Save</button>
              </div>
            </div>
          </div>
        )}

        {toast && <div className={`toast ${toast.type}`}>{toast.msg}</div>}
      </div>
  
  );
}
