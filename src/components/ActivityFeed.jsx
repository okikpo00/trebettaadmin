// src/components/ActivityFeed.jsx
import React from "react";

function formatDate(d) {
  try {
    const dt = new Date(d);
    if (isNaN(dt)) return "-";
    return dt.toLocaleString();
  } catch (e) {
    return "-";
  }
}

export default function ActivityFeed({ items = [], loading }) {
  if (loading) {
    return (
      <div className="feed-placeholder">
        <div className="skeleton row" />
        <div className="skeleton row" />
        <div className="skeleton row" />
      </div>
    );
  }

  const rows = Array.isArray(items) ? items : [];

  if (!rows.length) return <div className="muted">No recent activity</div>;

  return (
    <div className="activity-feed">
      {rows.map((it, idx) => (
        <div className="feed-item" key={it.id ?? idx}>
          <div className="feed-left">
            <div className="feed-title">{it.event_type ? `${it.event_type}`.replace(/_/g, " ") : it.kind ?? "event"}</div>
            <div className="muted small">{it.username ?? it.user ?? `User ${it.user_id ?? "-"}`}</div>
          </div>
          <div className="feed-right">
            {it.amount ? <div className="amount">₦{Number(it.amount).toLocaleString()}</div> : null}
            <div className="muted tiny">{formatDate(it.created_at ?? it.createdAt ?? it.created)}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
