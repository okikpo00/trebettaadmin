// src/components/KycModal.jsx
import React, { useEffect, useState } from "react";
import api from "../api";
import "../css/Users.css";

export default function KycModal({ open, onClose, userId }) {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    (async () => {
      setLoading(true);
      try {
        const res = await api.get(`/admin/users/${userId}/kyc`);
        setDocs(res.data.docs || []);
      } catch (err) {
        console.error("kyc fetch", err);
        setDocs([]);
      } finally { setLoading(false); }
    })();
  }, [open, userId]);

  const act = async (type, note) => {
    try {
      if (type === "approve") {
        await api.post(`/admin/users/${userId}/kyc/approve`, { note });
        alert("KYC approved");
      } else {
        await api.post(`/admin/users/${userId}/kyc/reject`, { reason: note });
        alert("KYC rejected");
      }
      onClose();
    } catch (err) {
      console.error("kyc act", err);
      alert("Action failed");
    }
  };

  if (!open) return null;
  return (
    <div className="modal-backdrop">
      <div className="modal-card modal-large">
        <h3>KYC Documents</h3>
        {loading ? <p>Loading...</p> : docs.length === 0 ? <p className="muted">No documents</p> : (
          <div className="kyc-list">
            {docs.map((d) => (
              <div key={d.id} className="kyc-row">
                <div>
                  <strong>{d.document_type}</strong>
                  <div className="muted small">{new Date(d.created_at).toLocaleString()}</div>
                </div>
                <div className="kyc-actions">
                  <a href={d.url} target="_blank" rel="noreferrer" className="btn ghost">Open</a>
                </div>
              </div>
            ))}
            <div style={{marginTop:12}}>
              <button className="btn primary" onClick={() => act("approve", "")}>Approve</button>
              <button className="btn ghost" onClick={() => act("reject", "Rejected by admin")}>Reject</button>
            </div>
          </div>
        )}
        <div className="modal-actions">
          <button className="btn ghost" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

