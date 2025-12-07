// src/components/Pagination.jsx
import React from "react";
import "../css/Shared.css";

export default function Pagination({ page, setPage, total, limit }) {
  const totalPages = Math.max(1, Math.ceil((total || 0) / limit));
  return (
    <div className="pager">
      <div><small>Showing {Math.min(limit, total || 0)} of {total || 0}</small></div>
      <div className="pager-controls">
        <button className="btn ghost" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Prev</button>
        <span className="muted">Page {page} / {totalPages}</span>
        <button className="btn ghost" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>Next</button>
      </div>
    </div>
  );
}
