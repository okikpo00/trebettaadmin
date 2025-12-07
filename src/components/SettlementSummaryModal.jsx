// src/components/SettlementSummaryModal.jsx
import React from "react";
import "../css/SettlementSummaryModal.css";

export default function SettlementSummaryModal({ summary, onClose }) {
  if (!summary) return null; // no popup if no summary

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <h3 className="modal-title">Settlement Summary</h3>

        <div className="modal-content">
          <p><strong>Bet ID:</strong> {summary.bet_Id}</p>
          <p><strong>Status:</strong> {summary.status}</p>
          <p><strong>Winning Option:</strong> {summary.winning_option_name || summary.winning_option_id}</p>
          <p><strong>Total Pot:</strong> ₦{summary.total_pot}</p>
          <p><strong>Company Cut:</strong> ₦{summary.company_cut}</p>
          <p><strong>Distributable Pool:</strong> ₦{summary.distributable_pool}</p>
          <p><strong>Winners Count:</strong> {summary.winners_count}</p>
           <p><strong>losers Count:</strong> {summary.losers_count}</p>
          <p><strong>Total Payout:</strong> ₦{summary.total_payout}</p>
          <p><strong>Payouts Done:</strong> {summary.payouts_done === "YES" ? "✅" : "❌"}</p>
          <p><strong>Settled At:</strong> {summary.settled_at ? new Date(summary.settled_at).toLocaleString() : "-"}</p>
        </div>

        <div className="modal-actions">
          <button className="btn confirm" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
