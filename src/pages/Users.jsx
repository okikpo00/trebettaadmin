// src/pages/Users.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import "../css/Users.css";
import Pagination from "../components/Pagination";
import ConfirmModal from "../components/ConfirmModal";

export default function Users() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [selected, setSelected] = useState([]); // kept for row checkboxes (no bulk actions)
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [kycStatus, setKycStatus] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(12);
  const [total, setTotal] = useState(0);

  // confirm modal
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmPayload, setConfirmPayload] = useState(null); // { id, action, label }

  const fetchUsers = async (p = page) => {
    setLoading(true);
    try {
      const res = await api.get("/admin/users", {
        params: {
          page: p,
          limit,
          search: search || undefined,
          status: status || undefined,
          kyc_status: kycStatus || undefined,
        },
      });
      setUsers(res.data.data || []);
      setTotal(res.data.total || 0);
    } catch (err) {
      console.error("fetch users err", err);
      alert(err.response?.data?.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(1);
    // eslint-disable-next-line
  }, [status, kycStatus]);

  useEffect(() => {
    const t = setTimeout(() => {
      setPage(1);
      fetchUsers(1);
    }, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line
  }, [search]);

  useEffect(() => { fetchUsers(page); /* eslint-disable-line */ }, [page]);

  const toggleSelect = (id) => {
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  };

  const selectAllOnPage = () => {
    const ids = users.map((u) => u.id);
    const allSelected = ids.length > 0 && ids.every((id) => selected.includes(id));
    setSelected((prev) => (allSelected ? prev.filter((id) => !ids.includes(id)) : Array.from(new Set([...prev, ...ids]))));
  };

  // single suspend/unsuspend using PATCH /admin/users/status/:id { action: "suspend"|"unsuspend" }
  const singleSuspendUnsuspend = async (id, action) => {
    try {
      await api.patch(`/admin/users/status/${id}`, { action });
      fetchUsers(page);
      alert(`User ${action}ed`);
    } catch (err) {
      console.error("single action err", err);
      alert(err.response?.data?.message || "Action failed");
    }
  };

  const openConfirm = (id, action, label) => {
    setConfirmPayload({ id, action, label });
    setConfirmOpen(true);
  };

  const handleConfirm = async () => {
    if (!confirmPayload) return setConfirmOpen(false);
    const { id, action } = confirmPayload;
    setConfirmOpen(false);
    setConfirmPayload(null);
    await singleSuspendUnsuspend(id, action);
  };

  const exportUsers = async () => {
    try {
      const res = await api.get("/admin/users/export", {
        responseType: "blob",
        params: { status: status || undefined, kyc_status: kycStatus || undefined }
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "users_export.xlsx");
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("export err", err);
      alert(err.response?.data?.message || "Export failed");
    }
  };

  return (
    <div className="users-page container">
      <div className="page-head">
        <h1>Users</h1>
        <div className="head-actions">
          <button className="btn ghost" onClick={() => { setSearch(""); setStatus(""); setKycStatus(""); fetchUsers(1); }}>Reset</button>
          <button className="btn primary" onClick={exportUsers}>Export XLSX</button>
        </div>
      </div>

      <div className="filters-row">
        <div className="filter-left">
          <input
            className="input"
            placeholder="Search id, username, email or phone"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select className="select" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
            <option value="">All statuses</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
            <option value="blocked">Blocked</option>
          </select>
          <select className="select" value={kycStatus} onChange={(e) => { setKycStatus(e.target.value); setPage(1); }}>
            <option value="">All KYC status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        <div className="filter-right">
          <button className="btn" onClick={() => fetchUsers(1)}>Refresh</button>
        </div>
      </div>

      <div className="table-wrap card">
        <table className="users-table">
          <thead>
            <tr>
              <th style={{ width: 36 }}>
                <input
                  type="checkbox"
                  onChange={selectAllOnPage}
                  checked={users.length > 0 && users.every(u => selected.includes(u.id))}
                  aria-label="select all"
                />
              </th>
              <th>ID</th>
              <th>Username</th>
              <th>Email / Phone</th>
              <th>Status</th>
              <th>KYC</th>
              <th>Balance</th>
              <th>Joined</th>
              <th style={{ width: 140 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="9" className="td-center">Loading...</td></tr>
            ) : users.length === 0 ? (
              <tr><td colSpan="9" className="td-center">No users</td></tr>
            ) : users.map((u) => (
              <tr key={u.id} title={`${u.first_name || ""} ${u.last_name || ""}`}>
                <td><input type="checkbox" checked={selected.includes(u.id)} onChange={() => toggleSelect(u.id)} /></td>
                <td className="mono">{u.id}</td>
                <td className="username-cell">
                  <div className="username-main">{u.username || `${u.first_name || ""} ${u.last_name || ""}`}</div>
                  <div className="muted small">{u.role || ""}</div>
                </td>
                <td>
                  <div className="muted">{u.email || "—"}</div>
                  <div className="muted small">{u.phone || ""}</div>
                </td>
                <td>
                  <span className={`badge ${u.status === "suspended" ? "danger" : u.status === "blocked" ? "dark" : "success"}`}>
                    {u.status}
                  </span>
                </td>

                {/* KYC: combine level + status */}
                <td>
                  <div className="kyc-inline">
                    <span className={`badge ${u.kyc_status === "approved" ? "success" : u.kyc_status === "rejected" ? "danger" : "warn"}`}>
                      {u.kyc_status || "none"}
                    </span>
                    <small className="muted level">{u.kyc_level ? `Level ${u.kyc_level}` : "—"}</small>
                  </div>
                </td>

                <td className="mono">₦{Number(u.balance || 0).toLocaleString()}</td>
                <td className="muted small">{u.created_at ? new Date(u.created_at).toLocaleDateString() : "-"}</td>
                <td>
                  <div className="row-actions">
                    <button className="action" onClick={() => navigate(`/dashboard/users/${u.id}`)}>View</button>
                    {u.status === "suspended" ? (
                      <button className="action" onClick={() => openConfirm(u.id, "unsuspend", "Unsuspend user")}>Unsuspend</button>
                    ) : (
                      <button className="action warn" onClick={() => openConfirm(u.id, "suspend", "Suspend user")}>Suspend</button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination page={page} setPage={setPage} total={total} limit={limit} />

      {/* Confirm modal for single suspend/unsuspend */}
      {confirmOpen && (
        <ConfirmModal
          title={confirmPayload?.label || "Confirm"}
          message={`Are you sure you want to ${confirmPayload?.action || ""} this user?`}
          onCancel={() => { setConfirmOpen(false); setConfirmPayload(null); }}
          onConfirm={handleConfirm}
        />
      )}
    </div>
  );
}
