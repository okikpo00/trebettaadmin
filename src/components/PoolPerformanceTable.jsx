// src/components/PoolPerformanceTable.jsx
import React from "react";

export default function PoolPerformanceTable({ data = [], loading }) {
  if (loading) {
    return (
      <div className="table-placeholder">
        <div className="skeleton row" />
        <div className="skeleton row" />
      </div>
    );
  }

  const rows = Array.isArray(data) ? data : [];

  return (
    <div className="table-wrap">
      {rows.length === 0 ? (
        <div className="muted">No pools available</div>
      ) : (
        <table className="table">
          <thead>
            <tr><th>Pool</th><th>Type</th><th>Status</th><th>Participants</th><th>Total</th></tr>
          </thead>
          <tbody>
            {rows.map((p) => (
              <tr key={p.id}>
                <td className="pool-title">{p.title || `#${p.id}`}</td>
                <td>{p.type ?? "—"}</td>
                <td><span className={`tag ${p.status || "unknown"}`}>{p.status || "—"}</span></td>
                <td>{p.participant_count ?? p.participants ?? "—"}</td>
                <td>₦{Number(p.total_pool_amount || p.total_stake || 0).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
