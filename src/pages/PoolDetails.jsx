// src/pages/PoolDetails.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api";
import "../css/PoolDetails.css";
import Loader from "../components/Loader";
import PoolSettleModal from "../components/PoolSettleModal";
import ConfirmActionModal from "../components/ConfirmActionModal";
import AddOptionModal from "../components/AddOptionModal";
import { format } from "date-fns";

export default function PoolDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pool, setPool] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [ledger, setLedger] = useState(null);
  const [loading, setLoading] = useState(true);
  const [settleOpen, setSettleOpen] = useState(false);
  const [addOptionOpen, setAddOptionOpen] = useState(false);
  const [confirm, setConfirm] = useState(null);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [poolRes, partsRes, ledgerRes] = await Promise.all([
        api.get(`/admin/pools/${id}`),
        api.get(`/admin/pools/${id}/participants`),
        api.get(`/admin/pools/${id}/ledger`)
      ]);

      const poolData = poolRes.data?.data ?? poolRes.data ?? poolRes.data?.pool ?? poolRes.data;
      setPool(poolData || null);

      const parts = partsRes.data?.data ?? partsRes.data ?? [];
      setParticipants(Array.isArray(parts) ? parts : []);

      const ledgerData = ledgerRes.data?.data ?? ledgerRes.data ?? {};
      setLedger(ledgerData.ledger || null);
    } catch (err) {
      console.error("fetch pool details", err);
      alert(err.response?.data?.message || "Failed to load pool details");
      navigate("/dashboard/pools");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, [id]);

  // Defensive guards so UI never crashes
  if (loading) return <Loader />;
  if (!pool) {
    return (
      <div className="pool-details container">
        <div className="empty-state">
          <h2>Pool not found</h2>
          <p className="muted">It may have been removed or unavailable</p>
          <button className="btn ghost" onClick={() => navigate("/dashboard/pools")}>Back to pools</button>
        </div>
      </div>
    );
  }

  const handleLock = async () => {
    try {
      await api.post(`/admin/pools/${id}/lock`);
      alert("Pool locked");
      fetchAll();
    } catch (err) {
      console.error("lock err", err);
      alert(err.response?.data?.message || "Failed to lock");
    }
  };

  const handleSettle = async (optionId) => {
    try {
      const res = await api.post(`/admin/pools/${id}/settle`, { winning_option_id: optionId });
      alert(res.data?.message ?? "Settlement queued");
      fetchAll();
    } catch (err) {
      console.error("settle err", err);
      alert(err.response?.data?.message || "Failed to settle");
    }
  };

  const handleEliminate = async (optionId) => {
    try {
      await api.post(`/admin/pools/option/eliminate`, { pool_id: id, option_id: optionId });
      alert("Option eliminated");
      fetchAll();
    } catch (err) {
      console.error("eliminate err", err);
      alert(err.response?.data?.message || "Failed to eliminate");
    }
  };

  const handleEditOption = async (optionId, newTitle) => {
    try {
      await api.put(`/admin/pool-options/${id}/options/${optionId}`, { title: newTitle });
      alert("Option updated");
      fetchAll();
    } catch (err) {
      console.error("edit option err", err);
      alert(err.response?.data?.message || "Failed to update");
    }
  };

  const handleRefund = async () => {
    try {
      // simple full refund action - backend expects body details (optionally entryIds)
      const res = await api.post(`/admin/pools/${id}/refund`, { reason: "Admin initiated refund" });
      alert(res.data?.message ?? "Refund started");
      fetchAll();
    } catch (err) {
      console.error("refund err", err);
      alert(err.response?.data?.message || "Failed to refund");
    }
  };

  return (
    <div className="pool-details container">
      <div className="top-row">
        <div>
          <h1 className="title">{pool.title}</h1>
          <div className="muted small">
            #{pool.id} • {pool.type?.toUpperCase() || "—"} • {pool.status} • Created {pool.created_at ? format(new Date(pool.created_at), "PP p") : "—"}
          </div>
          <p className="desc">{pool.description || "No description provided."}</p>
        </div>

        <div className="right-actions">
          {pool.status === "open" && <button className="btn warn" onClick={() => setConfirm({ action: "lock", title: "Lock Pool", message: "Lock pool? This prevents new entries." })}>Lock</button>}
          {pool.status === "locked" && <button className="btn primary" onClick={() => setSettleOpen(true)}>Settle Pool</button>}
          {pool.status === "locked" && <button className="btn danger" onClick={() => setConfirm({ action: "refund", title: "Refund Pool", message: "Refund all joined entries for this pool?", danger: true })}>Refund</button>}
          {pool.status === "open" && <button className="btn" onClick={() => setAddOptionOpen(true)}>Add Option</button>}
          <button className="btn ghost" onClick={() => navigate("/dashboard/pools")}>Back</button>
        </div>
      </div>

      <div className="grid">
        <div className="card">
          <h3>Summary</h3>
          <div className="kpi-row">
            <div><small className="muted">Min Entry</small><div>₦{Number(pool.min_entry || 0).toLocaleString()}</div></div>
            <div><small className="muted">Participants</small><div>{pool.participants ?? pool.participant_count ?? participants.length}</div></div>
            <div><small className="muted">Total Stake</small><div>₦{Number(pool.total_stake || pool.total_pool_amount || 0).toLocaleString()}</div></div>
            <div><small className="muted">Closing</small><div>{pool.closing_date ? format(new Date(pool.closing_date), "PP p") : "—"}</div></div>
          </div>
        </div>

        <div className="card">
          <h3>Options</h3>
          <table className="options-table">
            <thead><tr><th>ID</th><th>Title</th><th>Total Stake</th><th>Actions</th></tr></thead>
            <tbody>
              {(pool.options || []).map(o => (
                <tr key={o.id}>
                  <td>{o.id}</td>
                  <td>{o.title}</td>
                  <td>₦{Number(o.total_stake || 0).toLocaleString()}</td>
                  <td className="actions-cell">
                    {pool.status === "open" && (
                      <>
                        <button className="action edit" onClick={()=>{
                          const newTitle = prompt("New option title", o.title);
                          if (newTitle && newTitle !== o.title) handleEditOption(o.id, newTitle);
                        }}>Edit</button>
                      </>
                    )}

                    {pool.status === "locked" && (
                      <>
                        <button className="action primary" onClick={() => setConfirm({ action: "settle", payload: { option_id: o.id }, title: "Settle Pool", message: `Settle pool with "${o.title}" as winner?` })}>Settle</button>
                        <button className="action danger" onClick={() => setConfirm({ action: "eliminate", payload: { option_id: o.id }, title: "Eliminate Option", message: `Eliminate "${o.title}"? This marks entries as lost.` })}>Eliminate</button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="card">
          <h3>Recent Participants</h3>
          <div className="participants">
            {participants.length === 0 ? <div className="muted">No participants</div> :
              participants.map(p => (
                <div className="participant" key={p.entry_id || p.id}>
                  <div>
                    <strong>{p.username}</strong>
                    <div className="muted small">{p.option_title}</div>
                  </div>
                  <div className="right">
                    <div>₦{Number(p.amount).toLocaleString()}</div>
                    <div className="muted tiny">{p.created_at ? format(new Date(p.created_at), "PP p") : "-"}</div>
                  </div>
                </div>
              ))
            }
          </div>
        </div>

    <div className="card full">
  <h3>Ledger / Payouts</h3>

  {!ledger ? (
    <div className="muted">No ledger found</div>
  ) : (
    <>
      <div className="ledger-summary">
        <div><small className="muted">Total Pool</small><div>₦{Number(ledger.total_pool).toLocaleString()}</div></div>
        <div><small className="muted">Company Cut</small><div>₦{Number(ledger.company_cut).toLocaleString()}</div></div>
        <div><small className="muted">Payout Pool</small><div>₦{Number(ledger.payout_pool).toLocaleString()}</div></div>
        <div><small className="muted">Total Winners</small><div>{ledger.total_winners}</div></div>
        <div><small className="muted">Settled At</small><div>{ledger.settled_at ? format(new Date(ledger.settled_at), "PP p") : "—"}</div></div>
      </div>

      <h4 style={{ marginTop: "20px" }}>Payouts</h4>
      {(() => {
        const payouts = (ledger.options || pool.options || [])
          .flatMap(opt => opt.entries || [])
          .filter(e => e.payout_amount);

        return payouts.length === 0 ? (
          <div className="muted">No payouts available</div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>User</th>
                <th>Option</th>
                <th>Amount</th>
                <th>Payout</th>
                <th>Txn Ref</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {payouts.map((p, i) => (
                <tr key={i}>
                  <td>{p.username}</td>
                  <td>{p.option_title || "-"}</td>
                  <td>₦{Number(p.amount).toLocaleString()}</td>
                  <td>₦{Number(p.payout_amount).toLocaleString()}</td>
                  <td className="muted small">{p.txn_ref || "-"}</td>
                  <td className="muted small">
                    {p.created_at ? format(new Date(p.created_at), "PP p") : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        );
      })()}
    </>
  )}
</div>
</div>

      {/* Modals */}
      {settleOpen && (
        <PoolSettleModal
          pool={pool}
          options={pool.options || []}
          onClose={() => setSettleOpen(false)}
          onSettle={(optionId) => { setSettleOpen(false); handleSettle(optionId); }}
        />
      )}

      {addOptionOpen && <AddOptionModal poolId={id} onClose={() => { setAddOptionOpen(false); fetchAll(); }} />}

      {confirm && (
        <ConfirmActionModal
          title={confirm.title}
          message={confirm.message}
          danger={confirm.danger}
          onCancel={() => setConfirm(null)}
          onConfirm={async () => {
            const action = confirm.action;
            if (action === "lock") { await handleLock(); }
            else if (action === "settle") { await handleSettle(confirm.payload.option_id); }
            else if (action === "eliminate") { await handleEliminate(confirm.payload.option_id); }
            else if (action === "refund") { await handleRefund(); }
            setConfirm(null);
            fetchAll();
          }}
        />
      )}
    </div>
  );
}
