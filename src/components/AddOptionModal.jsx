// src/components/AddOptionModal.jsx
import React, { useState } from "react";
import api from "../api";
import "../css/Modals.css";

export default function AddOptionModal({ poolId, onClose }) {
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!title.trim()) return alert("Option title required");
    setLoading(true);
    try {
      await api.post(`/admin/pools/${poolId}/options`, { title: title.trim() });
      alert("Option added");
      onClose();
    } catch (err) {
      console.error("add option err", err);
      alert(err.response?.data?.message || "Failed to add option");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <h3>Add Option</h3>
        <div className="form-row">
          <label>Label</label>
          <input value={title} onChange={(e)=>setTitle(e.target.value)} placeholder="Option label" />
        </div>

        <div className="modal-actions">
          <button className="btn ghost" onClick={onClose} disabled={loading}>Cancel</button>
          <button className="btn primary" onClick={submit} disabled={loading}>{loading ? "Adding..." : "Add Option"}</button>
        </div>
      </div>
    </div>
  );
}
