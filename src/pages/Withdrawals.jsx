// src/pages/Withdrawals.jsx
import React, { useEffect, useState } from "react";
import api from "../api";
import Pagination from "../components/Pagination";
import NotificationBell from "../components/NotificationBell";
import ConfirmActionModal from "../components/ConfirmActionModal";
import "../css/Withdrawals.css";

export default function Withdrawals() {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [total, setTotal] = useState(0);

  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const [confirmAction, setConfirmAction] = useState(null); // { id, action }

  async function fetchData(p = 1) {
    setLoading(true);
    try {
      const res = await api.get("/admin/withdraw", {
        params: {
          page: p,
          limit,
          status: status || undefined,
        },
      });

      const rows = res.data.data || [];
      setItems(rows);

      // backend does not return total currently
      // we fake a total just so pagination UI works
      const pseudoTotal =
        p * limit + (rows.length === limit ? 1 : 0);
      setTotal(pseudoTotal);
    } catch (err) {
      console.error("withdrawal list err:", err);
      alert(err.response?.data?.message || "Failed to load withdrawals");
    } finally {
      setLoading(false);
    }
  }

  async function handleAction(id, action) {
    try {
      if (action === "approve") {
        await api.post(`/admin/withdraw/${id}/approve`);
        alert("Withdrawal approved");
      } else {
        const reason = prompt("Enter rejection reason (optional):") || "";
        await api.post(`/admin/withdraw/${id}/reject`, { reason });
        alert("Withdrawal rejected");
      }

      fetchData(page);
    } catch (err) {
      console.error("withdraw action err:", err);
      alert(err.response?.data?.message || "Action failed");
    }
  }

  useEffect(() => {
    setPage(1);
    fetchData(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  useEffect(() => {
    fetchData(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const handleReset = () => {
    setStatus("");
    setPage(1);
    fetchData(1);
  };

  return (
    <div className="admin-page container">
      <div className="page-head">
        <h1>Withdrawals</h1>
        <div className="head-right">
          <NotificationBell />
        </div>
      </div>

      <div className="filters-row">
        <div className="filter-left">
          <select
            className="select"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All status</option>
            <option value="pending">Pending</option>
            <option value="pending_approval">Pending Approval</option>
            <option value="processing">Processing</option>
            <option value="completed">Completed</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        <div className="filter-right">
          <button className="btn ghost" onClick={handleReset}>
            Reset
          </button>
        </div>
      </div>

      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>User</th>
              <th>Amount</th>
              <th>Fee</th>
              <th>Reference</th>
              <th>Status</th>
              <th>Requested</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="8" className="td-center">
                  Loading...
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan="8" className="td-center">
                  No withdrawals found
                </td>
              </tr>
            ) : (
              items.map((w) => (
                <tr key={w.id}>
                  <td>{w.id}</td>
                  <td>{w.username || "-"}</td>
                  <td>₦{Number(w.amount).toLocaleString()}</td>
                  <td>₦{Number(w.fee || 0).toLocaleString()}</td>
                  <td className="muted small">{w.reference}</td>
                  <td>
                    <span
                      className={`badge ${
                        w.status === "completed"
                          ? "success"
                          : w.status === "pending" ||
                            w.status === "pending_approval"
                          ? "warn"
                          : w.status === "processing"
                          ? "info"
                          : "danger"
                      }`}
                    >
                      {w.status}
                    </span>
                  </td>
                  <td className="muted small">
                    {w.requested_at
                      ? new Date(w.requested_at).toLocaleString()
                      : "-"}
                  </td>
                  <td>
                    {(w.status === "pending" ||
                      w.status === "pending_approval") && (
                      <div className="action-row">
                        <button
                          className="btn small success"
                          onClick={() =>
                            setConfirmAction({ id: w.id, action: "approve" })
                          }
                        >
                          Approve
                        </button>
                        <button
                          className="btn small danger"
                          onClick={() =>
                            setConfirmAction({ id: w.id, action: "reject" })
                          }
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Pagination page={page} setPage={setPage} limit={limit} total={total} />

      {confirmAction && (
        <ConfirmActionModal
          title={
            confirmAction.action === "approve"
              ? "Approve Withdrawal"
              : "Reject Withdrawal"
          }
          message={
            confirmAction.action === "approve"
              ? "Are you sure you want to approve this withdrawal?"
              : "Are you sure you want to reject this withdrawal?"
          }
          danger={confirmAction.action === "reject"}
          onCancel={() => setConfirmAction(null)}
          onConfirm={() => {
            handleAction(confirmAction.id, confirmAction.action);
            setConfirmAction(null);
          }}
        />
      )}
    </div>
  );
}
