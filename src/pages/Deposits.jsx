// src/pages/Deposits.jsx
import React, { useEffect, useState } from "react";
import api from "../api";
import Pagination from "../components/Pagination";
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

  // Ensure session headers
  useEffect(() => {
    const sessionId = localStorage.getItem("admin_session_id");
    const token = localStorage.getItem("admin_token");
    if (token) {
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    }
    if (sessionId) {
      api.defaults.headers.common["x-admin-session-id"] = sessionId;
    }
  }, []);

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
        params.user_id = raw;
      } else {
        params.reference = raw;
      }
    }

    return params;
  };

  const fetchData = async (p = 1) => {
    setLoading(true);
    try {
      const params = buildQueryParams();
      params.page = p;

      const res = await api.get("/admin/deposits", { params });

      const rows = res.data?.data ?? [];
      const t = res.data?.total ?? 0;

      setItems(rows);
      setTotal(t);
    } catch (err) {
      console.error("deposit list error:", err);
      alert(err.response?.data?.message || "Failed to load deposits");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
    fetchData(1);
  }, [status, provider]);

  useEffect(() => {
    fetchData(page);
  }, [page]);

  const resetFilters = () => {
    setSearch("");
    setStatus("");
    setProvider("");
    setPage(1);
    fetchData(1);
  };

  return (
    <div className="admin-page container">
      <div className="page-head">
        <h1>Completed Deposits</h1>
        <div className="head-right">
          <a href="/dashboard/deposits/pending" className="btn primary">
            Pending Deposits →
          </a>
        </div>
      </div>

      {/* Filters */}
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
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="">All status</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
          </select>

          <select
            className="select"
            value={provider}
            onChange={(e) => setProvider(e.target.value)}
          >
            <option value="">All providers</option>
            <option value="Manual">Manual</option>
            <option value="AdminCredit">Admin Credit</option>
            <option value="Flutterwave">Flutterwave</option>
            <option value="Paystack">Paystack</option>
          </select>
        </div>

        <div className="filter-right">
          <button className="btn ghost" onClick={resetFilters}>
            Reset
          </button>
        </div>
      </div>

      {/* Table */}
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
                  No deposit records found.
                </td>
              </tr>
            ) : (
              items.map((d) => (
                <tr key={d.id}>
                  <td>{d.id}</td>
                  <td>
                    <div>{d.username || "-"}</div>
                    <div className="muted tiny">{d.user_id}</div>
                  </td>
                  <td>₦{Number(d.amount).toLocaleString()}</td>
                  <td>{d.provider || "-"}</td>
                  <td>{d.type}</td>
                  <td className="muted small">{d.reference}</td>

                  <td>
                    <span
                      className={`badge ${
                        d.status === "completed"
                          ? "success"
                          : d.status === "failed"
                          ? "danger"
                          : "warn"
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

      <Pagination page={page} setPage={setPage} total={total} limit={limit} />
    </div>
  );
}
