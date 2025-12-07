// src/pages/Pools.jsx
import React, { useEffect, useState } from "react";
import api from "../api";
import "../css/Pools.css";
import CreatePoolModal from "../components/CreatePoolModal";
import Pagination from "../components/Pagination";
import { formatDistanceToNowStrict } from "date-fns";

export default function Pools() {
  const [pools, setPools] = useState([]);
  const [loading, setLoading] = useState(false);
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(12);
  const [total, setTotal] = useState(0);
  const [showCreate, setShowCreate] = useState(false);

  const fetchPools = async (p = page) => {
    setLoading(true);
    try {
      const res = await api.get("/admin/pools", {
        params: { page: p, limit, type: typeFilter || undefined, status: statusFilter || undefined },
      });
      // backend may return {data: rows, meta: {...}} or rows directly
      const data = res.data?.data ?? res.data;
      const meta = res.data?.meta ?? { total: res.data?.total ?? data?.length ?? 0 };
      setPools(Array.isArray(data) ? data : []);
      setTotal(meta.total ?? 0);
    } catch (err) {
      console.error("fetch pools err", err);
      alert(err.response?.data?.message || "Failed to load pools");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPools(1); }, [typeFilter, statusFilter]);

  useEffect(() => { fetchPools(page); }, [page]);

  return (
    <div className="pools-page container">
      <div className="page-head">
        <div>
          <h1>Pools</h1>
          <p className="muted">Create, manage and settle pools (Pulse / Grand)</p>
        </div>
        <div className="head-actions">
          <button className="btn ghost" onClick={() => { setTypeFilter(""); setStatusFilter(""); setPage(1); fetchPools(1); }}>Reset</button>
          <button className="btn primary" onClick={() => setShowCreate(true)}>Create Pool</button>
        </div>
      </div>

      <div className="filters-row">
        <div className="filter-left">
          <select className="select" value={typeFilter} onChange={(e)=>{ setTypeFilter(e.target.value); setPage(1); }}>
            <option value="">All types</option>
            <option value="pulse">Pulse</option>
            <option value="grand">Grand</option>
          </select>

          <select className="select" value={statusFilter} onChange={(e)=>{ setStatusFilter(e.target.value); setPage(1); }}>
            <option value="">All status</option>
            <option value="open">Open</option>
            <option value="locked">Locked</option>
            <option value="settled">Settled</option>
            <option value="rollover">Rollover</option>
          </select>
        </div>

        <div className="filter-right">
          <small className="muted">Showing {pools.length} of {total}</small>
        </div>
      </div>

      <div className="cards-grid">
        {loading ? (
          <div className="loader-card">Loading pools...</div>
        ) : pools.length === 0 ? (
          <div className="empty">No pools found</div>
        ) : pools.map(p => (
          <div key={p.id} className="pool-card">
            <div className="card-head">
              <div>
                <h3 className="title">{p.title || `Pool #${p.id}`}</h3>
                <div className="muted tiny">
                  {p.type?.toUpperCase() || "—"} • #{p.id} • {p.status}
                </div>
              </div>
              <div className="card-actions">
                <button className="btn ghost" onClick={() => window.location.href = `/dashboard/pools/${p.id}`}>View</button>
              </div>
            </div>

            <p className="desc">{p.description || "No description"}</p>

            <div className="meta-row">
              <div>
                <small className="muted">Min</small>
                <div className="kpi">₦{Number(p.min_entry || p.minEntry || 0).toLocaleString()}</div>
              </div>

              <div>
                <small className="muted">Participants</small>
                <div className="kpi">{p.participants ?? p.participant_count ?? 0}</div>
              </div>

              <div>
                <small className="muted">Total Stake</small>
                <div className="kpi">₦{Number(p.total_stake || p.total_pool_amount || 0).toLocaleString()}</div>
              </div>

           <div>
  <small className="muted">Closes</small>
  <div className="kpi">
    {p.status === "open" && p.closing_date
      ? formatDistanceToNowStrict(new Date(p.closing_date)) + " left"
      : p.status === "locked"
      ? "Locked"
      : p.status === "settled"
      ? "Settled"
      : p.status === "rollover"
      ? "Rollover"
      : "—"}
  </div>
</div>
            </div>
          </div>
        ))}
      </div>

      <Pagination page={page} setPage={setPage} total={total} limit={limit} />

      {showCreate && <CreatePoolModal onClose={() => { setShowCreate(false); fetchPools(1); }} />}
    </div>
  );
}
