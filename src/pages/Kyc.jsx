import React, { useEffect, useState } from "react";
import api from "../api";
import NotificationBell from "../components/NotificationBell";
import Pagination from "../components/Pagination";
import KycReviewModal from "../components/KycReviewModal";
import "../css/Kyc.css";

export default function Kyc() {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(15);
  const [total, setTotal] = useState(0);

  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const [selected, setSelected] = useState(null); // record for modal

  const fetchList = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/kyc/pending");
      let list = res.data.data || [];

      // simple search: ID, username, email
      if (search.trim()) {
        const s = search.trim().toLowerCase();
        list = list.filter((k) =>
          String(k.id).includes(s) ||
          (k.username && k.username.toLowerCase().includes(s)) ||
          (k.email && k.email.toLowerCase().includes(s))
        );
      }

      setTotal(list.length);

      const start = (page - 1) * limit;
      setItems(list.slice(start, start + limit));
    } catch (err) {
      console.error("KYC fetch error:", err);
      alert(err.response?.data?.message || "Failed to load KYC list");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  useEffect(() => {
    setPage(1);
    fetchList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const handleReviewClick = (k) => {
    console.log("Review clicked for KYC:", k);
    setSelected(k);
  };

  return (
    <div className="admin-page container">
      <div className="page-head">
        <h1>KYC Verification</h1>
        <div className="head-right">
          <NotificationBell />
        </div>
      </div>

      <div className="filters-row">
        <input
          type="text"
          className="input"
          placeholder="Search by KYC ID, username, email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button
          className="btn ghost"
          onClick={() => {
            setSearch("");
            setPage(1);
          }}
        >
          Reset
        </button>
      </div>

      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>KYC ID</th>
              <th>User</th>
              <th>Name</th>
              <th>Document</th>
              <th>Submitted</th>
              <th>Status</th>
              <th style={{ width: 100 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" className="td-center">
                  Loading…
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan="7" className="td-center">
                  No pending KYC
                </td>
              </tr>
            ) : (
              items.map((k) => (
                <tr key={k.id}>
                  <td>{k.id}</td>

                  <td>
                    <div>{k.username || "-"}</div>
                    <div className="small muted">{k.email}</div>
                  </td>

                  <td>
                    {k.first_name} {k.last_name}
                  </td>

                  <td>{k.document_type}</td>

                  <td className="small muted">
                    {k.created_at
                      ? new Date(k.created_at).toLocaleString()
                      : "-"}
                  </td>

                  <td>
                    <span className="badge warn">Pending</span>
                  </td>

                  <td>
                    <button
                      className="btn small primary"
                      onClick={() => handleReviewClick(k)}
                    >
                      Review
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Pagination page={page} setPage={setPage} total={total} limit={limit} />

      {selected && (
        <KycReviewModal
          record={selected}
          onClose={() => {
            setSelected(null);
            fetchList();
          }}
        />
      )}
    </div>
  );
}
