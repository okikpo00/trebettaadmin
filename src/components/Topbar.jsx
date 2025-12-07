import React from "react";
import "../css/Topbar.css";

export default function Topbar({ toggleSidebar }) {
  return (
    <div className="topbar">
      <button className="menu-btn" onClick={toggleSidebar}>☰</button>
      <div className="topbar-center">
        <input type="text" placeholder="Search..." />
      </div>
      <div className="topbar-right">
        <span className="icon">🔔</span>
        <span className="icon">👤</span>
      </div>
    </div>
  );
}

