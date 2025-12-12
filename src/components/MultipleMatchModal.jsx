// src/components/MultipleMatchModal.jsx
import React from "react";
import "../css/Modals.css";

export default function MultipleMatchModal({ amount, matches, onClose, onSelect }) {
  if (!matches || matches.length === 0) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-card wide">
        <div className="modal-header-row">
          <h3>Multiple Matches Found</h3>
          <button className="btn ghost" onClick={onClose}>
            Close
          </button>
        </div>

        <p className="muted small">
          There are multiple pending deposits with the amount{" "}
          <strong>₦{Number(amount).toLocaleString()}</strong>. Select the correct one to match.
        </p>

        <div className="table-wrap" style={{ maxHeight: "320px", overflowY: "auto", marginTop: 12 }}>
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>User</th>
                <th>Amount</th>
                <th>Reference</th>
                <th>Created At</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {matches.map((d) => (
                <tr key={d.id}>
                  <td>{d.id}</td>
                  <td>
                    <div>{d.username || "-"}</div>
                    <div className="muted tiny">{d.email || "-"}</div>
                  </td>
                  <td>₦{Number(d.amount).toLocaleString()}</td>
                  <td className="muted tiny">{d.reference}</td>
                  <td className="muted tiny">
                    {d.created_at ? new Date(d.created_at).toLocaleString() : "—"}
                  </td>
                  <td>
                    <button
                      className="btn primary tiny-btn"
                      type="button"
                      onClick={() => onSelect(d.id)}
                    >
                      Select This Deposit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}
