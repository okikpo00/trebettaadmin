import React, { useState, useEffect } from "react";
import ConfirmActionModal from "./ConfirmActionModal";
import "../css/KycReviewModal.css";
import api from "../api";

export default function KycReviewModal({ record, onClose }) {
  const [confirm, setConfirm] = useState(null); // {type: "approve"/"reject"}
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    console.log("KYC Review Modal opened with record:", record);
  }, [record]);

  if (!record) {
    // If for any reason record is missing, fail gracefully
    return null;
  }

  const approve = async () => {
    setLoading(true);
    try {
      await api.post(`/admin/kyc/approve/${record.id}`);
      alert("KYC approved");
      onClose && onClose();
    } catch (err) {
      console.error("KYC approve error:", err);
      alert(err.response?.data?.message || "Approval failed");
    } finally {
      setLoading(false);
    }
  };

  const reject = async (reason) => {
    setLoading(true);
    try {
      await api.post(`/admin/kyc/reject/${record.id}`, { reason });
      alert("KYC rejected");
      onClose && onClose();
    } catch (err) {
      console.error("KYC reject error:", err);
      alert(err.response?.data?.message || "Rejection failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="kyc-modal-overlay">
      <div className="kyc-modal">
        <button className="close-btn" onClick={onClose}>
          ×
        </button>

        <h2 className="modal-title">Review KYC</h2>

        <div className="kyc-section">
          <h3>User Information</h3>
          <p>
            <strong>Name:</strong> {record.first_name} {record.last_name}
          </p>
          <p>
            <strong>Username:</strong> {record.username || "-"}
          </p>
          <p>
            <strong>Email:</strong> {record.email || "-"}
          </p>
        </div>

        <div className="kyc-section">
          <h3>Document</h3>
          <p>
            <strong>Type:</strong> {record.document_type || "-"}
          </p>

          <div className="kyc-images">
            {record.document_url && (
              <div className="kyc-img-box">
                <p className="small muted">Front</p>
                <img src={record.document_url} alt="front" />
              </div>
            )}

            {record.document_url_back && (
              <div className="kyc-img-box">
                <p className="small muted">Back</p>
                <img src={record.document_url_back} alt="back" />
              </div>
            )}

            {record.selfie_url && (
              <div className="kyc-img-box">
                <p className="small muted">Selfie</p>
                <img src={record.selfie_url} alt="selfie" />
              </div>
            )}
          </div>
        </div>

        <div className="kyc-actions">
          <button
            className="btn danger"
            onClick={() => setConfirm({ type: "reject" })}
            disabled={loading}
          >
            Reject
          </button>

          <button
            className="btn success"
            onClick={() => setConfirm({ type: "approve" })}
            disabled={loading}
          >
            Approve
          </button>
        </div>
      </div>

      {confirm && (
        <ConfirmActionModal
          title={confirm.type === "approve" ? "Approve KYC" : "Reject KYC"}
          message={
            confirm.type === "approve"
              ? "Are you sure you want to approve this KYC?"
              : "This KYC will be rejected. Continue?"
          }
          danger={confirm.type === "reject"}
          onCancel={() => setConfirm(null)}
          onConfirm={async () => {
            if (confirm.type === "approve") {
              await approve();
            } else {
              const reason =
                prompt("Reason for rejection?") || "Invalid documents";
              await reject(reason);
            }
            setConfirm(null);
          }}
        />
      )}
    </div>
  );
}
