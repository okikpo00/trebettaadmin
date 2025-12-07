// src/components/TopWalletsTable.jsx
import React from "react";

export default function TopWalletsTable({ data = [], loading }) {
  if (loading) {
    return (
      <div className="table-placeholder">
        <div className="skeleton row" />
        <div className="skeleton row" />
        <div className="skeleton row" />
      </div>
    );
  }

  const rows = Array.isArray(data) ? data : [];

  return (
    <div className="table-wrap small">
      {rows.length === 0 ? (
        <div className="muted">No wallets to show</div>
      ) : (
        <table className="table">
          <thead>
            <tr><th>#</th><th>User</th><th>Balance</th></tr>
          </thead>
          <tbody>
            {rows.slice(0, 10).map((r, i) => (
              <tr key={r.user_id || r.id || i}>
                <td>{i + 1}</td>
                <td className="user-cell">
                  <div className="username">{r.username ?? r.user ?? r.email ?? "—"}</div>
                  <div className="muted small">{r.email ?? ""}</div>
                </td>
                <td>₦{Number(r.balance || r.amount || 0).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
