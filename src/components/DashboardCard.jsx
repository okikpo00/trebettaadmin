// src/components/DashboardCard.jsx
import React from "react";

export default function DashboardCard({ title, value, loading }) {
  return (
    <div className={`dash-card ${loading ? "loading" : ""}`}>
      <div className="card-title">{title}</div>
      <div className="card-value">{loading ? <div className="skeleton short" /> : value}</div>
    </div>
  );
}
