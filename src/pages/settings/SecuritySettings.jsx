// src/pages/settings/SecuritySettings.jsx
import React, { useEffect, useState } from "react";
import api from "../../api";
import "../../css/Settings.css";

function parseUserAgent(ua = "") {
  const s = ua.toLowerCase();
  let device = "Unknown device";
  let os = "";

  if (s.includes("android")) {
    device = "Android device";
  } else if (s.includes("iphone") || s.includes("ios")) {
    device = "iPhone / iOS";
  } else if (s.includes("windows")) {
    device = "Windows PC";
  } else if (s.includes("macintosh") || s.includes("mac os")) {
    device = "Mac";
  }

  if (s.includes("windows")) os = "Windows";
  else if (s.includes("android")) os = "Android";
  else if (s.includes("iphone") || s.includes("ios")) os = "iOS";
  else if (s.includes("macintosh")) os = "macOS";

  let browser = "Unknown browser";
  if (s.includes("edg")) browser = "Microsoft Edge";
  else if (s.includes("chrome")) browser = "Chrome";
  else if (s.includes("firefox")) browser = "Firefox";
  else if (s.includes("safari") && !s.includes("chrome")) browser = "Safari";

  return {
    device,
    os,
    browser,
  };
}

export default function SecuritySettings() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [killingId, setKillingId] = useState(null);
  const [killingOthers, setKillingOthers] = useState(false);

  // ensure session header is set
  useEffect(() => {
    const sessionId = localStorage.getItem("admin_session_id");
    if (sessionId) {
      api.defaults.headers.common["x-admin-session-id"] = sessionId;
    }
  }, []);

  const handleSessionError = (err) => {
    const msg = err.response?.data?.message || "Request failed";
    console.error("session error", msg);
    if (
      msg.includes("Admin session ID missing") ||
      msg.includes("This session was terminated")
    ) {
      alert(msg);
      // Force logout
      localStorage.removeItem("admin_token");
      localStorage.removeItem("admin_session_id");
      window.location.href = "/";
    } else {
      alert(msg);
    }
  };

  const fetchSessions = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/sessions");
      const data = res.data?.data ?? res.data;
      setSessions(Array.isArray(data) ? data : []);
    } catch (err) {
      handleSessionError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const killSession = async (id) => {
    if (!window.confirm("Terminate this session?")) return;
    setKillingId(id);
    try {
      await api.post(`/admin/sessions/${id}/kill`);
      alert("Session terminated");
      fetchSessions();
    } catch (err) {
      handleSessionError(err);
    } finally {
      setKillingId(null);
    }
  };

  const killOthers = async () => {
    if (!window.confirm("Logout all other devices?")) return;
    setKillingOthers(true);
    try {
      await api.post("/admin/sessions/kill-others");
      alert("Other sessions terminated");
      fetchSessions();
    } catch (err) {
      handleSessionError(err);
    } finally {
      setKillingOthers(false);
    }
  };

  return (
    <div className="settings-grid">
      <div className="settings-card full">
        <div className="settings-card-head">
          <div>
            <h3>Active Sessions</h3>
            <p className="muted small">
              See where your admin account is currently logged in.
            </p>
          </div>
          <div>
            {sessions.length > 1 && (
              <button
                className="btn danger"
                onClick={killOthers}
                disabled={killingOthers}
              >
                {killingOthers ? "Logging out..." : "Logout Other Devices"}
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <div>Loading sessions...</div>
        ) : sessions.length === 0 ? (
          <div className="muted small">No active sessions found.</div>
        ) : (
          <table className="table small-table">
            <thead>
              <tr>
                <th>Device</th>
                <th>IP</th>
                <th>Browser / OS</th>
                <th>Started</th>
                <th>Last Active</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {sessions.map((s) => {
                const parsed = parseUserAgent(s.user_agent || "");
                return (
                  <tr key={s.id}>
                    <td>
                      <strong>{parsed.device}</strong>
                      {s.is_current ? (
                        <span className="badge current-badge">Current</span>
                      ) : null}
                    </td>
                    <td>{s.ip_address || "—"}</td>
                    <td className="muted small">
                      {parsed.browser} • {parsed.os}
                    </td>
                    <td className="muted small">
                      {s.created_at
                        ? new Date(s.created_at).toLocaleString()
                        : "—"}
                    </td>
                    <td className="muted small">
                      {s.last_active
                        ? new Date(s.last_active).toLocaleString()
                        : "—"}
                    </td>
                    <td>
                      {!s.is_current && (
                        <button
                          className="btn ghost tiny-btn"
                          onClick={() => killSession(s.id)}
                          disabled={killingId === s.id}
                        >
                          {killingId === s.id ? "Terminating..." : "Terminate"}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
