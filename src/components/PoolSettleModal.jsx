// src/components/PoolSettleModal.jsx
import React, { useState } from "react";
import "../css/Modals.css";

export default function PoolSettleModal({ pool, options = [], onClose, onSettle }) {
  const [selected, setSelected] = useState(null);
  return (
    <div className="modal-overlay">
      <div className="modal-card wide">
        <h3>Settle Pool: {pool.title}</h3>
        <p className="muted">Choose winning option to start settlement. This action triggers payouts — irreversible.</p>

        <div className="options-list">
          {options.map(o => (
            <label key={o.id} className={`settle-option ${selected === o.id ? "selected" : ""}`}>
              <input type="radio" name="win" value={o.id} checked={selected === o.id} onChange={() => setSelected(o.id)} />
              <div>
                <div className="opt-title">{o.title}</div>
                <div className="muted tiny">Total stake: ₦{Number(o.total_stake || 0).toLocaleString()}</div>
              </div>
            </label>
          ))}
        </div>

        <div className="modal-actions">
          <button className="btn ghost" onClick={onClose}>Cancel</button>
          <button className="btn primary" onClick={() => selected ? onSettle(selected) : alert("Select an option")}>Settle</button>
        </div>
      </div>
    </div>
  );
}
