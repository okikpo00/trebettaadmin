// src/pages/Billboards.jsx
import React, { useEffect, useState, useMemo } from "react";
import api from "../api";
import BillboardFormModal from "../components/BillboardFormModal";
import ConfirmModal from "../components/ConfirmModal";
import Toast from "../components/Toast";
import "../css/Billboards.css";

export default function Billboards() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [toast, setToast] = useState(null);

  // UI controls
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const limit = 10;
  const [sortBy, setSortBy] = useState("created_at"); // created_at | status | title
  const [sortDir, setSortDir] = useState("desc"); // asc | desc
  const [total, setTotal] = useState(0);

  const activeCount = useMemo(() => items.filter(i => i.status === "active").length, [items]);

  const fetchList = async (p = page) => {
    setLoading(true);
    try {
      const res = await api.get("/admin/billboards", {
        params: { page: p, limit, q: q || undefined, sortBy, sortDir }
      });
      // support backends returning {data:rows, meta} or simply array
      const data = res.data?.data ?? res.data ?? [];
      setItems(Array.isArray(data) ? data : (data.rows || []));
      setTotal(res.data?.total ?? (Array.isArray(data) ? data.length : (res.data?.meta?.total ?? 0)));
      setPage(Number(p));
    } catch (err) {
      console.error("fetch billboards err", err);
      alert(err.response?.data?.message || "Failed to load billboards");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchList(1); }, [q, sortBy, sortDir]);

  const openCreate = () => { setEditing(null); setModalOpen(true); };
  const openEdit = (item) => { setEditing(item); setModalOpen(true); };

  const onSave = (msg = "Saved") => {
    setToast({ type: "success", message: msg });
    setModalOpen(false);
    fetchList(page);
  };

  const onDelete = (id) => {
    setConfirm({
      title: "Delete Billboard",
      message: "This will permanently remove the billboard. Continue?",
      onConfirm: async () => {
        try {
          await api.delete(`/admin/billboards/${id}`);
          setToast({ type: "success", message: "Billboard deleted" });
          setConfirm(null);
          // refresh
          fetchList(page);
        } catch (err) {
          console.error("delete error", err);
          alert(err.response?.data?.message || "Failed to delete");
        }
      },
      onCancel: () => setConfirm(null),
    });
  };

  const toggleActive = async (item) => {
    // If activating, ensure no more than 3 active
    const newStatus = item.status === "active" ? "inactive" : "active";
    if (newStatus === "active" && activeCount >= 3) {
      alert("You can only have 3 active billboards at a time.");
      return;
    }
    try {
      await api.put(`/admin/billboards/${item.id}`, { ...item, status: newStatus });
      setToast({ type: "success", message: `Billboard ${newStatus}` });
      fetchList(page);
    } catch (err) {
      console.error("toggle status err", err);
      alert(err.response?.data?.message || "Failed to update status");
    }
  };

  const handlePage = (dir) => {
    const next = dir === "next" ? page + 1 : Math.max(1, page - 1);
    fetchList(next);
  };

  return (
    <div className="page billboards container">
      <div className="page-head">
        <div>
          <h1>Billboards</h1>
          <p className="muted">Manage promotional billboards shown to users.</p>
        </div>

        <div className="actions">
          <div className="search">
            <input value={q} onChange={(e)=>setQ(e.target.value)} placeholder="Search title or description..." />
          </div>
          <select value={sortBy} onChange={e=>setSortBy(e.target.value)} className="select-inline">
            <option value="created_at">Newest</option>
            <option value="status">Status</option>
            <option value="title">Title</option>
          </select>
          <select value={sortDir} onChange={e=>setSortDir(e.target.value)} className="select-inline">
            <option value="desc">Desc</option>
            <option value="asc">Asc</option>
          </select>

          <button className="btn ghost" onClick={() => fetchList(1)}>Reload</button>
          <button className="btn primary" onClick={openCreate}>+ Add Billboard</button>
        </div>
      </div>

      <div className="overview-row">
        <div className="pill">Total: {total}</div>
        <div className="pill">Active: {activeCount}</div>
      </div>

      <div className="table-wrap">
        <table className="table billboard-table">
          <thead>
            <tr>
              <th>Title</th>
              <th className="desc-col">Description</th>
              <th>Status</th>
              <th>Created</th>
              <th style={{width: 170}}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="5" className="td-center">Loading...</td></tr>
            ) : items.length === 0 ? (
              <tr><td colSpan="5" className="td-center">No billboards</td></tr>
            ) : items.map(it => (
              <tr key={it.id}>
                <td className="bold">{it.title}</td>
                <td className="desc-col muted small">{it.description ? (it.description.length>150 ? it.description.slice(0,150)+"…" : it.description) : "-"}</td>
                <td>
                  <span className={`badge ${it.status==="active"?"success": "muted"}`}>{it.status || "inactive"}</span>
                </td>
                <td className="muted small">{new Date(it.created_at || it.createdAt || Date.now()).toLocaleString()}</td>
                <td>
                  <div className="row-actions">
                    <button className="action" onClick={()=>openEdit(it)}>Edit</button>
                    <button className="action outline" onClick={()=>toggleActive(it)}>{it.status==="active"?"Deactivate":"Activate"}</button>
                    <button className="action danger" onClick={()=>onDelete(it.id)}>Delete</button>
                    <a className="action ghost" href={it.redirect_link || "#"} target="_blank" rel="noreferrer">Preview</a>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="pager-row">
        <div className="muted">Page {page}</div>
        <div className="pager-controls">
          <button className="btn ghost" onClick={()=>handlePage("prev")}>Prev</button>
          <button className="btn ghost" onClick={()=>handlePage("next")}>Next</button>
        </div>
      </div>

      {modalOpen && (
        <BillboardFormModal
          item={editing}
          activeCount={activeCount}
          onClose={() => setModalOpen(false)}
          onSaved={onSave}
          showToast={(t)=>setToast(t)}
        />
      )}

      {confirm && (
        <ConfirmModal title={confirm.title} message={confirm.message}
          onConfirm={() => { confirm.onConfirm(); }}
          onCancel={() => { confirm.onCancel(); }}
        />
      )}

      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}
    </div>
  );
}
