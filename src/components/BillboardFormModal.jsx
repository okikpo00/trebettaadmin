// src/components/BillboardFormModal.jsx
import React, { useEffect, useState } from "react";
import api from "../api";
import "../css/Billboards.css";
import Toast from "./Toast";

export default function BillboardFormModal({ item = null, onClose = ()=>{}, onSaved = ()=>{}, activeCount = 0, showToast = ()=>{} }) {
  const editing = Boolean(item && item.id);
  const [title, setTitle] = useState(item?.title ?? "");
  const [description, setDescription] = useState(item?.description ?? "");
  const [imageUrl, setImageUrl] = useState(item?.image_url ?? item?.image ?? "");
  const [videoUrl, setVideoUrl] = useState(item?.video_url ?? item?.video ?? "");
  const [redirect, setRedirect] = useState(item?.redirect_link ?? item?.redirect ?? "");
  const [status, setStatus] = useState(item?.status ?? "inactive");
  const [loading, setLoading] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(()=> {
    // ensure default status for new ones
    if (!editing && !item) setStatus("inactive");
  }, [editing, item]);

  const validate = () => {
    if (!title.trim()) return "Title is required";
    if (!description.trim()) return "Description is required";
    if (status === "active" && !editing && activeCount >= 3) return "Max 3 active billboards allowed — deactivate one first";
    return null;
  };

  const doSave = async () => {
    const v = validate();
    if (v) return setToast({ type: "error", message: v });

    setLoading(true);
    try {
      const payload = { title: title.trim(), description: description.trim(), image_url: imageUrl || null, video_url: videoUrl || null, redirect_link: redirect || null, status };
      if (editing) {
        await api.put(`/admin/billboards/${item.id}`, payload);
        showToast({ type: "success", message: "Billboard updated" });
        onSaved("Updated");
      } else {
        await api.post(`/admin/billboards`, payload);
        showToast({ type: "success", message: "Billboard created" });
        onSaved("Created");
      }
    } catch (err) {
      console.error("save billboard err", err);
      setToast({ type: "error", message: err.response?.data?.message || "Save failed" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card billboard-modal">
        <div className="modal-header">
          <h3>{editing ? "Edit Billboard" : "Create Billboard"}</h3>
          <button className="btn ghost small" onClick={onClose}>Close</button>
        </div>

        <div className="modal-body">
          <label>Title</label>
          <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Short headline" />

          <label>Description</label>
          <textarea value={description} onChange={e=>setDescription(e.target.value)} placeholder="Short description (shown below the title)"></textarea>

          <div className="row two">
            <div>
              <label>Image URL</label>
              <input value={imageUrl} onChange={e=>setImageUrl(e.target.value)} placeholder="https://res.cloudinary.com/..." />
            </div>
            <div>
              <label>Video URL (optional)</label>
              <input value={videoUrl} onChange={e=>setVideoUrl(e.target.value)} placeholder="YouTube or video URL" />
            </div>
          </div>

          <label>Redirect Link (optional)</label>
          <input value={redirect} onChange={e=>setRedirect(e.target.value)} placeholder="https://..." />

          <div className="row between center">
            <div className="switch-row">
              <label className="muted small">Active</label>
              <input type="checkbox" checked={status==="active"} onChange={(e)=>setStatus(e.target.checked ? "active" : "inactive")} />
            </div>

            <div className="preview-actions">
              <button className="btn ghost small" onClick={() => setPreviewMode(p => !p)}>{previewMode ? "Hide Preview" : "Preview"}</button>
            </div>
          </div>

          {previewMode && (
            <div className="preview">
              <div className="preview-left">
                <div className="preview-card">
                  <div className="preview-title">{title || "Title preview"}</div>
                  <div className="preview-desc">{description || "Description preview"}</div>
                  {imageUrl ? <img src={imageUrl} alt="preview" onError={()=>setToast({type:"error", message:"Image failed to load"})} /> : videoUrl ? <div className="video-wrap"><iframe title="video preview" src={videoUrl} frameBorder="0" /></div> : <div className="muted small">No image/video</div>}
                </div>
              </div>
            </div>
          )}

        </div>

        <div className="modal-footer">
          <div className="muted small">Max 3 active billboards at once.</div>
          <div>
            <button className="btn ghost" onClick={onClose} disabled={loading}>Cancel</button>
            <button className="btn primary" onClick={doSave} disabled={loading}>{loading ? "Saving..." : editing ? "Update" : "Create"}</button>
          </div>
        </div>
      </div>

      {toast && <Toast type={toast.type} message={toast.message} onClose={()=>setToast(null)} />}
    </div>
  );
}
