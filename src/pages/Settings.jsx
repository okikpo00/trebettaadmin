// src/pages/Settings.jsx
import React, { useState } from "react";
import "../css/Settings.css";
import ProfileSettings from "./settings/ProfileSettings";
import SystemSettings from "./settings/SystemSettings";
import SecuritySettings from "./settings/SecuritySettings";

export default function Settings() {
  const [tab, setTab] = useState("profile");

  const renderTab = () => {
    if (tab === "profile") return <ProfileSettings />;
    if (tab === "system") return <SystemSettings />;
    if (tab === "security") return <SecuritySettings />;
    return null;
  };

  return (
    <div className="settings-page container">
      <div className="settings-header">
        <div>
          <h1>Admin Settings</h1>
          <p className="muted">
            Manage your admin profile, system rules and security sessions.
          </p>
        </div>
      </div>

      <div className="settings-tabs">
        <button
          className={`settings-tab ${tab === "profile" ? "active" : ""}`}
          onClick={() => setTab("profile")}
        >
          My Profile
        </button>
        <button
          className={`settings-tab ${tab === "system" ? "active" : ""}`}
          onClick={() => setTab("system")}
        >
          System Settings
        </button>
        <button
          className={`settings-tab ${tab === "security" ? "active" : ""}`}
          onClick={() => setTab("security")}
        >
          Security & Sessions
        </button>
      </div>

      <div className="settings-content">{renderTab()}</div>
    </div>
  );
}
