// src/pages/Deposits.jsx
import React, { useEffect, useState } from "react";
import api from "../api";
import DepositFormModal from "../components/DepositFormModal";
import Pagination from "../components/Pagination";
import NotificationBell from "../components/NotificationBell";
import "../css/Deposits.css";

export default function Deposits() {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [total, setTotal] = useState(0);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [provider, setProvider] = useState("");
  const [loading, setLoading] = useState(false);
  const [showManual, setShowManual] = useState(false);

  const buildQueryParams = () => {
    const params = {
      page,
      limit,
      status: status || undefined,
      provider: provider || undefined,
    };

    if (search.trim()) {
      const raw = search.trim();
      if (/^\d+$/.test(raw)) {
        // numeric → treat as user_id
        params.user_id = raw;
      } else {
        // non-numeric → treat as reference
        params.reference = raw;
      }
    }

    return params;
  };

  async function fetchData(p = 1) {
    setLoading(true);
    try {
      const params = buildQueryParams();
      params.page = p;

      const res = await api.get("/admin/deposits", { params });

      setItems(res.data.data || []);
      setTotal(res.data.total || 0);
    } catch (err) {
      console.error("deposit list error:", err);
      alert(err.response?.data?.message || "Failed to load deposits");
    } finally {
      setLoading(false);
    }
  }

  // refetch when filters change
  useEffect(() => {
    setPage(1);
    fetchData(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, provider]);

  // refetch when page changes
  useEffect(() => {
    fetchData(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const handleReset = () => {
    setSearch("");
    setStatus("");
    setProvider("");
    setPage(1);
    fetchData(1);
  };

  return (
    <div className="admin-page container">
      <div className="page-head">
        <h1>Deposits</h1>
        <div className="head-right">
          <NotificationBell />
          <button className="btn primary" onClick={() => setShowManual(true)}>
            Manual Deposit
          </button>
        </div>
      </div>

      <div className="filters-row">
        <div className="filter-left">
          <input
            className="input"
            placeholder="Search by user ID or reference..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select
            className="select"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All status</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
          </select>

          <select
            className="select"
            value={provider}
            onChange={(e) => {
              setProvider(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All providers</option>
            <option value="Flutterwave">Flutterwave</option>
            <option value="Paystack">Paystack</option>
            <option value="Manual">Manual</option>
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
              <th>Provider</th>
              <th>Type</th>
              <th>Reference</th>
              <th>Status</th>
              <th>Date</th>
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
                  No deposits found
                </td>
              </tr>
            ) : (
              items.map((d) => (
                <tr key={d.id}>
                  <td>{d.id}</td>
                  <td>{d.username || "-"}</td>
                  <td>₦{Number(d.amount).toLocaleString()}</td>
                  <td>{d.provider || "-"}</td>
                  <td>{d.type}</td>
                  <td className="muted small">{d.reference}</td>
                  <td>
                    <span
                      className={`badge ${
                        d.status === "completed"
                          ? "success"
                          : d.status === "pending"
                          ? "warn"
                          : d.status === "failed"
                          ? "danger"
                          : ""
                      }`}
                    >
                      {d.status}
                    </span>
                  </td>
                  <td className="muted small">
                    {new Date(d.created_at).toLocaleString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Pagination page={page} setPage={setPage} limit={limit} total={total} />

      {showManual && (
        <DepositFormModal
          onClose={() => {
            setShowManual(false);
            fetchData(page);
          }}
        />
      )}
    </div>
  );
}
