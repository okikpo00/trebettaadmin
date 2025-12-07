// src/pages/UserAudit.jsx
import React, { useEffect, useState } from "react";
import api from "../api";

export default function UserAudit({ userId }) {
  const [logs, setLogs] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/admin/users/${userId}/audit`, { params: { page } });
      setLogs(res.data.data || res.data || []);
    } catch (err) {
      console.error("audit fetch", err);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLogs(); }, [userId, page]);

  if (loading) return <div>Loading audit...</div>;
  if (!logs || logs.length === 0) return <div className="muted small">No audit logs</div>;

  return (
    <div className="audit-list">
      {logs.map((l) => (
        <div className="audit-row" key={l.id}>
          <div className="audit-left">
            <div className="muted small">{new Date(l.created_at).toLocaleString()}</div>
            <div><b>{l.action}</b> — {l.entity}</div>
          </div>
          <div className="audit-right muted small">{l.details ? JSON.stringify(l.details) : ""}</div>
        </div>
      ))}
      {/* simple pagination if needed */}
      <div style={{marginTop:10}}>
        <button className="btn ghost" disabled={page<=1} onClick={()=>setPage(p=>p-1)}>Prev</button>
        <span className="muted" style={{margin:"0 8px"}}>Page {page}</span>
        <button className="btn ghost" onClick={()=>setPage(p=>p+1)}>Next</button>
      </div>
    </div>
  );
}
