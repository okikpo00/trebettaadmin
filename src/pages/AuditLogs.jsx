// src/pages/AuditLogs.jsx
import React, { useEffect, useState } from "react";
import api from "../api";
import "../css/AuditLogs.css";
import { format } from "date-fns";

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit] = useState(50);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/dashboard/activity", {
        params: { page, limit }
      });

      // 🔥 extract exactly from backend shape
      const logArray =
        res.data?.data?.data ??
        res.data?.data ??
        [];

      setLogs(Array.isArray(logArray) ? logArray : []);
    } catch (err) {
      console.error("audit logs fetch error", err);
      alert("Failed to load logs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page]);

  return (
    <div className="audit-page container">
      <div className="audit-header">
        <h1>Audit Logs</h1>
        <p className="muted">System-wide actions & admin activity</p>
      </div>

      {loading ? (
        <div className="loading">Loading logs...</div>
      ) : logs.length === 0 ? (
        <div className="empty">No audit logs found</div>
      ) : (
        <div className="audit-list">
          {logs.map((log) => (
            <div className="audit-item" key={log.id}>
              
              <div className="audit-left">
                <div className="audit-title">
                  {log.event_type?.replace(/_/g, " ") ?? "EVENT"}
                </div>

                <div className="audit-meta">
                  {log.user_name ? (
                    <span>User: {log.user_name}</span>
                  ) : (
                    <span>Admin Action</span>
                  )}
                </div>
              </div>

              <div className="audit-right">
                <div className="audit-date">
                  {format(new Date(log.created_at), "PPpp")}
                </div>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}
