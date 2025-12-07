import React, { useEffect, useState } from "react";
import api from "../api";
import Pagination from "../components/Pagination";
import ConfirmModal from "../components/ConfirmModal";
import TransactionDetailModal from "../components/TransactionDetailModal";
import "../css/Transactions.css";

export default function Transactions() {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(12);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState("");
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [selectedTx, setSelectedTx] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);

  const fetchList = async (p = page) => {
    setLoading(true);
    try {
      const res = await api.get("/admin/transactions", {
        params: { page: p, limit, type: type || undefined, status: status || undefined, search: search || undefined },
      });
      setItems(res.data.data || res.data);
      setTotal(res.data.meta?.total ?? res.data.total ?? 0);
    } catch (err) {
      console.error("transactions list err", err);
      alert(err.response?.data?.message || "Failed to load transactions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchList(1); }, [type, status]);
  useEffect(() => { fetchList(page); }, [page]);

  const openVerify = (tx) => {
    setConfirmAction({ type: "verify", tx });
    setConfirmOpen(true);
  };

  const openReverse = (tx) => {
    setConfirmAction({ type: "reverse", tx });
    setConfirmOpen(true);
  };

  const doConfirmedAction = async () => {
    if (!confirmAction) return;
    try {
      if (confirmAction.type === "verify") {
        // verify route expects reference as param
        await api.post(`/admin/transactions/verify/${confirmAction.tx.reference}`);
        alert("Transaction verified");
      } else if (confirmAction.type === "reverse") {
        await api.post(`/admin/transactions/reverse/${confirmAction.tx.id}`, { reason: "Admin reversal" });
        alert("Transaction reversed");
      }
      setConfirmOpen(false);
      fetchList(page);
    } catch (err) {
      console.error("tx action err", err);
      alert(err.response?.data?.message || "Action failed");
    }
  };

  const exportCSV = async () => {
    try {
      const res = await api.get("/admin/transactions/export", { responseType: "blob", params: { type: type || undefined, status: status || undefined }});
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement("a");
      a.href = url;
      a.setAttribute("download", `transactions_${Date.now()}.csv`);
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      console.error("export tx err", err);
      alert("Export failed");
    }
  };

  return (
    <div className="admin-page container transactions-page">
      <div className="page-head">
        <h1>Transactions</h1>
        <div className="head-right">
          <button className="btn ghost" onClick={() => { setSearch(""); setType(""); setStatus(""); fetchList(1); }}>Reset</button>
          <button className="btn" onClick={exportCSV}>Export CSV</button>
        </div>
      </div>

      <div className="filters-row">
        <div className="filter-left">
          <input className="input" placeholder="Search reference or username..." value={search} onChange={(e) => setSearch(e.target.value)} />
          <select className="select" value={type} onChange={(e) => setType(e.target.value)}>
            <option value="">All types</option>
            <option value="deposit">Deposit</option>
            <option value="withdrawal">Withdrawal</option>
            <option value="admin_credit">Admin Credit</option>
            <option value="admin_debit">Admin Debit</option>
          </select>
          <select className="select" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">All status</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
          </select>
          <button className="btn" onClick={() => fetchList(1)}>Search</button>
        </div>
      </div>

      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr><th>Reference</th><th>User</th><th>Type</th><th>Amount</th><th>Status</th><th>Date</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {loading ? <tr><td colSpan="7" className="td-center">Loading...</td></tr> :
              items.length === 0 ? <tr><td colSpan="7" className="td-center">No transactions</td></tr> :
              items.map(tx => (
                <tr key={tx.id}>
                  <td className="muted small">{tx.reference || tx.id}</td>
                  <td>{tx.username || tx.email || "—"}</td>
                  <td>{tx.type}</td>
                  <td>₦{Number(tx.amount).toLocaleString()}</td>
                  <td><span className={`badge ${tx.status === "completed" ? "success" : tx.status === "pending" ? "warn" : "danger"}`}>{tx.status}</span></td>
                  <td className="muted small">{new Date(tx.created_at).toLocaleString()}</td>
                  <td>
                    <div className="row-actions">
                      <button className="action" onClick={() => setSelectedTx(tx)}>View</button>
                      {tx.status !== "completed" && <button className="action" onClick={() => openVerify(tx)}>Verify</button>}
                      {tx.status === "completed" && <button className="action warn" onClick={() => openReverse(tx)}>Reverse</button>}
                    </div>
                  </td>
                </tr>
              ))
            }
          </tbody>
        </table>
      </div>

      <Pagination page={page} setPage={setPage} total={total} limit={limit} />

      {confirmOpen && (
        <ConfirmModal
          title={confirmAction?.type === "verify" ? "Confirm Verify" : "Confirm Reverse"}
          message={confirmAction?.type === "verify" ? `Verify transaction ${confirmAction.tx.reference}?` : `Reverse transaction ${confirmAction.tx.reference}? This will create a reversal.`}
          onCancel={() => setConfirmOpen(false)}
          onConfirm={doConfirmedAction}
        />
      )}

      {selectedTx && (
        <TransactionDetailModal tx={selectedTx} onClose={() => setSelectedTx(null)} onUpdated={() => fetchList(page)} />
      )}
    </div>
  );
}
