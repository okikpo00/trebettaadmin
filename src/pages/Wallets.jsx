import React, { useEffect, useState } from "react";
import api from "../api";
import Pagination from "../components/Pagination";
import ConfirmModal from "../components/ConfirmModal";
import CreditDebitModal from "../components/CreditDebitModal";
import "../css/Wallets.css";
import { useNavigate } from "react-router-dom";

export default function Wallets() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(12);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [selectedWallet, setSelectedWallet] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmPayload, setConfirmPayload] = useState(null);
  const [showCreditDebit, setShowCreditDebit] = useState(false);
  const [creditMode, setCreditMode] = useState("credit"); // or "debit"

  const fetchList = async (p = page) => {
    setLoading(true);
    try {
      const res = await api.get("/admin/wallets", {
        params: { page: p, limit, search: search || undefined, status: status || undefined },
      });
      // backend returns { data: rows, meta: { total, page, limit } }
      setItems(res.data.data || res.data || []);
      setTotal(res.data.meta?.total ?? res.data.total ?? 0);
      setPage(res.data.meta?.page ?? p);
    } catch (err) {
      console.error("wallets list err", err);
      alert(err.response?.data?.message || "Failed to load wallets");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchList(1); }, [status]);
  useEffect(() => { fetchList(page); }, [page]);

  const openFreeze = (wallet) => {
    setSelectedWallet(wallet);
    setConfirmPayload({
      title: wallet.status === "frozen" ? "Unfreeze Wallet" : "Freeze Wallet",
      message: `Are you sure you want to ${wallet.status === "frozen" ? "unfreeze" : "freeze"} wallet for ${wallet.username || wallet.email}?`,
      action: wallet.status === "frozen" ? "unfreeze" : "freeze",
      walletId: wallet.user_id || wallet.wallet_id || wallet.id,
    });
    setConfirmOpen(true);
  };

  const doFreeze = async () => {
    if (!confirmPayload) return;
    try {
      const { action, walletId } = confirmPayload;
      const path = action === "freeze" ? `/admin/wallets/freeze/${walletId}` : `/admin/wallets/unfreeze/${walletId}`;
      await api.patch(path, { reason: "Admin action" });
      setConfirmOpen(false);
      fetchList(page);
      alert(`Wallet ${action === "freeze" ? "frozen" : "unfrozen"} successfully`);
    } catch (err) {
      console.error("freeze err", err);
      alert(err.response?.data?.message || "Action failed");
    }
  };

  const openCreditDebit = (wallet, mode = "credit") => {
    setSelectedWallet(wallet);
    setCreditMode(mode);
    setShowCreditDebit(true);
  };

  const downloadCSV = async () => {
    try {
      const res = await api.get("/admin/wallets/export", { responseType: "blob", params: { status: status || undefined, search: search || undefined }});
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement("a");
      a.href = url;
      a.setAttribute("download", `wallets_export_${Date.now()}.xlsx`);
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      console.error("export wallets err", err);
      alert("Export failed");
    }
  };

  return (
    <div className="admin-page container wallets-page">
      <div className="page-head">
        <h1>Wallets</h1>
        <div className="head-right">
          <button className="btn ghost" onClick={() => { setSearch(""); setStatus(""); fetchList(1); }}>Reset</button>
          <button className="btn" onClick={downloadCSV}>Export XLSX</button>
        </div>
      </div>

      <div className="filters-row">
        <div className="filter-left">
          <input className="input" placeholder="Search username, email or wallet id" value={search} onChange={(e) => setSearch(e.target.value)} />
          <select className="select" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">All status</option>
            <option value="active">Active</option>
            <option value="frozen">Frozen</option>
          </select>
          <button className="btn" onClick={() => fetchList(1)}>Search</button>
        </div>
      </div>

      <div className="table-wrap">
        <table className="cards-table">
          <thead>
            <tr>
              <th>Wallet</th>
              <th>User</th>
              <th>Balance</th>
              <th>Reserved</th>
              <th>Currency</th>
              <th>Status</th>
              <th style={{width:220}}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="7" className="td-center">Loading...</td></tr>
            ) : items.length === 0 ? (
              <tr><td colSpan="7" className="td-center">No wallets</td></tr>
            ) : items.map((w) => (
              <tr key={w.wallet_id || w.id}>
                <td className="wallet-id">{w.wallet_id ?? w.id}</td>
                <td>
                  <div className="username">{w.username || w.email || "—"}</div>
                  <div className="muted small">{w.email}</div>
                </td>
                <td>₦{Number(w.balance || 0).toLocaleString()}</td>
                <td>₦{Number(w.reserved_balance || 0).toLocaleString()}</td>
                <td>{w.currency || "NGN"}</td>
                <td><span className={`badge ${w.status === "frozen" ? "danger" : "success"}`}>{w.status}</span></td>
                <td>
                  <div className="row-actions">
                    <button className="action" onClick={() => navigate(`/dashboard/wallets/${w.wallet_id || w.id}`)}>View</button>
                    <button className="action" onClick={() => openCreditDebit(w, "credit")}>Credit</button>
                    <button className="action warn" onClick={() => openCreditDebit(w, "debit")}>Debit</button>
                    <button className="action ghost" onClick={() => openFreeze(w)}>{w.status === "frozen" ? "Unfreeze" : "Freeze"}</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination page={page} setPage={setPage} total={total} limit={limit} />

      {confirmOpen && (
        <ConfirmModal
          title={confirmPayload?.title}
          message={confirmPayload?.message}
          onCancel={() => setConfirmOpen(false)}
          onConfirm={doFreeze}
        />
      )}

      {showCreditDebit && selectedWallet && (
        <CreditDebitModal
          user={selectedWallet}
          mode={creditMode}
          onClose={() => { setShowCreditDebit(false); setSelectedWallet(null); fetchList(page); }}
        />
      )}
    </div>
  );
}
