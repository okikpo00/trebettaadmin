import React, { useEffect, useState, useRef } from "react";
import api from "../api";
import "../css/Deposits.css";
import MatchDepositModal from "../components/MatchDepositModal";
import MultipleMatchModal from "../components/MultipleMatchModal";

export default function PendingDeposits() {
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);

  const [matchItem, setMatchItem] = useState(null); // single match modal
  const [multiMatches, setMultiMatches] = useState(null); // multiple match modal

  const [quickAmount, setQuickAmount] = useState("");
  const countdownInterval = useRef(null);

  // Set admin session header
  useEffect(() => {
    const sid = localStorage.getItem("admin_session_id");
    if (sid) api.defaults.headers.common["x-admin-session-id"] = sid;
  }, []);

  // Fetch pending deposits
  const fetchPending = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/deposits/pending");
      const rows = res.data?.data ?? [];
      setPending(rows);
    } catch (err) {
      console.error("pending deposits error:", err);
      alert(err.response?.data?.message || "Failed to load pending deposits");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  // Live countdown tick every 1s
  useEffect(() => {
    countdownInterval.current = setInterval(() => {
      setPending((prev) => [...prev]);
    }, 1000);

    return () => clearInterval(countdownInterval.current);
  }, []);

  const getRemaining = (expiresAt) => {
    const diff = new Date(expiresAt) - new Date();
    if (diff <= 0) return "Expired";

    const mins = Math.floor(diff / 60000);
    const secs = Math.floor((diff % 60000) / 1000);

    return `${mins}m ${secs}s`;
  };

  // Quick match by amount
  const handleQuickMatch = async () => {
    if (!quickAmount) return alert("Enter amount");

    try {
      const res = await api.post("/admin/deposits/match", {
        amount: Number(quickAmount),
      });

      if (res.data?.code === "MULTIPLE_MATCHES") {
        setMultiMatches(res.data.data); // open modal
      } else {
        alert("Deposit matched successfully");
        fetchPending();
      }
    } catch (err) {
      console.error("quick match error:", err);
      alert(err.response?.data?.message || "Match by amount failed");
    }
  };

  return (
    <div className="deposits-page">
      <div className="deposits-header">
        <div>
          <h2>Pending Deposits</h2>
          <div className="deposits-subtitle">Match and verify incoming deposits</div>
        </div>

        {/* Quick Match */}
        <div className="quick-match-card">
          <h4>Match by Amount</h4>
          <input
            type="number"
            placeholder="Enter amount"
            className="input"
            value={quickAmount}
            onChange={(e) => setQuickAmount(e.target.value)}
          />
          <button className="match-btn" onClick={handleQuickMatch}>
            Quick Match
          </button>
        </div>
      </div>

      {/* Pending Table */}
      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>User</th>
              <th>Sender</th>
              <th>Bank</th>
              <th>Amount</th>
              <th>Reference</th>
              <th>Expires In</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr><td colSpan="8" className="td-center">Loading...</td></tr>
            ) : pending.length === 0 ? (
              <tr><td colSpan="8" className="td-center">No pending deposits</td></tr>
            ) : (
              pending.map((p) => {
                const remaining = getRemaining(p.expires_at);

                return (
                  <tr key={p.id}>
                    <td>{p.id}</td>

                    <td>
                      <strong>{p.username}</strong>
                      <div className="muted small">{p.email}</div>
                    </td>

                    <td>{p.sender_name || "-"}</td>
                    <td>{p.sender_bank || "-"}</td>

                    <td>₦{Number(p.amount).toLocaleString()}</td>

                    <td className="small">{p.reference}</td>

                    <td
                      className={
                        remaining === "Expired"
                          ? "expired-text"
                          : remaining.includes("0m")
                          ? "warn-text"
                          : ""
                      }
                    >
                      {remaining}
                    </td>

                    <td>
                      <button
                        className="match-btn"
                        disabled={remaining === "Expired"}
                        onClick={() => setMatchItem(p)}
                      >
                        Match
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Modals */}
      {matchItem && (
        <MatchDepositModal
          deposit={matchItem}
          onClose={() => setMatchItem(null)}
          onMatched={() => {
            setMatchItem(null);
            fetchPending();
          }}
        />
      )}

      {multiMatches && (
        <MultipleMatchModal
          matches={multiMatches}
          onClose={() => setMultiMatches(null)}
          onSelect={(id) => {
            setMultiMatches(null);
            setMatchItem({ id });
          }}
        />
      )}
    </div>
  );
}
