// src/components/NotificationBell.jsx
import React, { useEffect, useState } from "react";
import api from "../api";
import "../css/Topbar.css";

export default function NotificationBell() {
  const [counts, setCounts] = useState({ kyc: 0, withdrawals: 0 });
  const [recent, setRecent] = useState([]);
  const [open, setOpen] = useState(false);

  const fetchCounts = async () => {
    try {
      const res = await api.get("/admin/notifications/unread-count");
      setCounts(res.data || {});
    } catch (err) {
      // fallback: ignore
      // console.error("notif count err", err);
    }
  };

  const fetchRecent = async () => {
    try {
      const res = await api.get("/admin/notifications/recent", { params: { limit: 8 } });
      setRecent(res.data || []);
    } catch (err) {}
  };

  useEffect(() => {
    fetchCounts();
    fetchRecent();
    const t = setInterval(fetchCounts, 30000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="notif-wrapper">
      <button className="notif-btn" onClick={() => { setOpen((o)=>!o); fetchRecent(); }}>
        🔔
        { (counts.kyc || counts.withdrawals) ? <span className="notif-badge">{(counts.kyc||0)+(counts.withdrawals||0)}</span> : null }
      </button>

      {open && (
        <div className="notif-dropdown">
          <div className="notif-title">Recent activity</div>
          <div className="notif-list">
            {recent.length === 0 ? <div className="muted small">No recent notifications</div> :
              recent.map((n, i) => (
                <div key={i} className="notif-item">
                  <div className="notif-msg">{n.message}</div>
                  <div className="muted small">{new Date(n.created_at).toLocaleString()}</div>
                </div>
              ))
            }
          </div>
          <div style={{padding:8, textAlign:"center"}}>
            <a href="/dashboard/kyc">Go to KYC</a> · <a href="/dashboard/withdrawals" style={{marginLeft:8}}>Withdrawals</a>
          </div>
        </div>
      )}
    </div>
  );
}
