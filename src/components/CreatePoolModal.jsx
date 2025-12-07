// src/components/CreatePoolModal.jsx
import React, { useState } from "react";
import api from "../api";
import "../css/Modals.css";
import { formatISO } from "date-fns";
import RolloverInfoModal from "./RolloverInfoModal";

export default function CreatePoolModal({ onClose }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("pulse");
  const [minEntry, setMinEntry] = useState("");
  const [closingDate, setClosingDate] = useState("");
  const [includeRollover, setIncludeRollover] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showRollover, setShowRollover] = useState(false);

  // default minimums for clarity
  const defaultMin = type === "pulse" ? 500 : 1000;

  const validate = () => {
    if (!title.trim()) return "Title is required";
    if (!description.trim()) return "Description is required";
    if (!minEntry) return "Min entry is required";
    if (!closingDate) return "Closing date is required";
    return null;
  };

  const handleCreate = async () => {
    const err = validate();
    if (err) return alert(err);

    const payload = {
      title: title.trim(),
      description: description.trim(),
      type,
      min_entry: Number(minEntry),
      closing_date: formatISO(new Date(closingDate)),
    };

    setLoading(true);

    try {
      // 1. Create pool
      const res = await api.post("/admin/pools", payload);
      const newPoolId = res.data?.data?.id || res.data?.pool_id || res.data?.id;

      if (!newPoolId) {
        alert("Pool created, but no ID returned.");
        onClose();
        return;
      }

      // 2. Auto-apply rollover if selected
      if (includeRollover) {
        await api.post("/admin/rollover/apply", { pool_id: newPoolId });
        alert("Pool created + rollover applied successfully");
      } else {
        alert("Pool created");
      }

      onClose();
    } catch (err) {
      console.error("create pool err", err);
      alert(err.response?.data?.message || "Failed to create pool");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="modal-overlay">
        <div className="modal-card wide">

          {/* Header */}
          <div className="modal-header-row">
            <h3>Create Pool</h3>
            <button className="btn ghost small" onClick={() => setShowRollover(true)}>
              View Rollover Balance
            </button>
          </div>

          {/* Title */}
          <div className="form-row">
            <label>Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Pool title"
            />
          </div>

          {/* Description */}
          <div className="form-row">
            <label>Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Explain the pool (required)"
            />
          </div>

          {/* Grid Fields */}
          <div className="form-grid">
            <div>
              <label>Type</label>
              <select value={type} onChange={(e) => setType(e.target.value)}>
                <option value="pulse">Pulse (default min ₦500)</option>
                <option value="grand">Grand (default min ₦1000)</option>
              </select>
            </div>

            <div>
              <label>Min entry (₦)</label>
              <input
                type="number"
                value={minEntry}
                onChange={(e) => setMinEntry(e.target.value)}
                placeholder={`${defaultMin}`}
              />
            </div>

            <div>
              <label>Closing date</label>
              <input
                type="datetime-local"
                value={closingDate}
                onChange={(e) => setClosingDate(e.target.value)}
              />
            </div>

            <div>
              <label>Include rollover</label>
              <select
                value={includeRollover ? "yes" : "no"}
                onChange={(e) => setIncludeRollover(e.target.value === "yes")}
              >
                <option value="no">No</option>
                <option value="yes">Yes (auto-apply rollover)</option>
              </select>
            </div>
          </div>

          {/* Buttons */}
          <div className="modal-actions">
            <button className="btn ghost" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button
              className="btn primary"
              onClick={handleCreate}
              disabled={loading}
            >
              {loading ? "Creating..." : "Create"}
            </button>
          </div>
        </div>
      </div>

      {/* Rollover Info Modal */}
      {showRollover && (
        <RolloverInfoModal onClose={() => setShowRollover(false)} />
      )}
    </>
  );
}
