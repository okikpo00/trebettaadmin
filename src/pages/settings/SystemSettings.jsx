// src/pages/settings/SystemSettings.jsx
import React, { useEffect, useState } from "react";
import api from "../../api";
import "../../css/Settings.css";

export default function SystemSettings() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [minDeposit, setMinDeposit] = useState("");
  const [minWithdraw, setMinWithdraw] = useState("");
  const [companyCut, setCompanyCut] = useState("");
  const [rolloverEnabled, setRolloverEnabled] = useState(false);

  const [feeRules, setFeeRules] = useState([]);

  // ensure session header is set
  useEffect(() => {
    const sessionId = localStorage.getItem("admin_session_id");
    if (sessionId) {
      api.defaults.headers.common["x-admin-session-id"] = sessionId;
    }
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/settings");
      const data = res.data?.data ?? res.data;

      setSettings(data);

      setMinDeposit(String(data.min_deposit ?? ""));
      setMinWithdraw(String(data.min_withdraw ?? ""));
      setCompanyCut(String(data.company_cut_percent ?? ""));
      setRolloverEnabled(Boolean(data.rollover_enabled));

      setFeeRules(data.withdraw_fee_rules || []);
    } catch (err) {
      console.error("settings fetch error", err);
      alert(err.response?.data?.message || "Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  // ---------------------------
  // HANDLE EDITING OF FEE RULES
  // ---------------------------

  const updateRule = (index, field, value) => {
    const updated = [...feeRules];
    updated[index] = { ...updated[index], [field]: value };
    setFeeRules(updated);
  };

  const addRule = () => {
    setFeeRules([
      ...feeRules,
      {
        min: 0,
        max: 0,
        fee: 0,
      },
    ]);
  };

  const deleteRule = (index) => {
    const updated = feeRules.filter((_, i) => i !== index);
    setFeeRules(updated);
  };

  // ---------------------------
  // SAVE ALL SETTINGS
  // ---------------------------

  const handleSave = async () => {
    if (!minDeposit || !minWithdraw || !companyCut) {
      return alert("All fields are required");
    }

    // basic validation for fee rules
    for (let r of feeRules) {
      if (Number(r.min) >= Number(r.max)) {
        return alert("Each rule must have MIN less than MAX.");
      }
    }

    setSaving(true);
    try {
      const payload = {
        min_deposit: Number(minDeposit),
        min_withdraw: Number(minWithdraw),
        company_cut_percent: Number(companyCut),
        rollover_enabled: rolloverEnabled,
        withdraw_fee_rules: feeRules.map((r) => ({
          min: Number(r.min),
          max: Number(r.max),
          fee: Number(r.fee),
        })),
      };

      const res = await api.put("/admin/settings", payload);
      alert(res.data?.message || "Settings updated successfully");

      const updated = res.data?.data ?? res.data;
      setSettings(updated);

      setMinDeposit(String(updated.min_deposit ?? ""));
      setMinWithdraw(String(updated.min_withdraw ?? ""));
      setCompanyCut(String(updated.company_cut_percent ?? ""));
      setRolloverEnabled(Boolean(updated.rollover_enabled));

      setFeeRules(updated.withdraw_fee_rules || []);
    } catch (err) {
      console.error("settings save error", err);
      alert(err.response?.data?.message || "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading && !settings) {
    return <div className="settings-card">Loading system settings...</div>;
  }

  return (
    <div className="settings-grid">

      {/* SYSTEM RULES */}
      <div className="settings-card">
        <h3>System Rules</h3>
        <p className="muted small">
          These rules control deposits, withdrawals and company revenue.
        </p>

        <div className="form-row">
          <label>Minimum Deposit (₦)</label>
          <input
            className="input"
            type="number"
            value={minDeposit}
            onChange={(e) => setMinDeposit(e.target.value)}
          />
        </div>

        <div className="form-row">
          <label>Minimum Withdrawal (₦)</label>
          <input
            className="input"
            type="number"
            value={minWithdraw}
            onChange={(e) => setMinWithdraw(e.target.value)}
          />
        </div>

        <div className="form-row">
          <label>Company Cut (%)</label>
          <input
            className="input"
            type="number"
            value={companyCut}
            onChange={(e) => setCompanyCut(e.target.value)}
          />
        </div>

        <div className="form-row toggle-row">
          <label>Rollover Enabled</label>
          <button
            type="button"
            className={`toggle ${rolloverEnabled ? "on" : ""}`}
            onClick={() => setRolloverEnabled((v) => !v)}
          >
            <span className="toggle-thumb" />
          </button>
          <span className="muted small">
            {rolloverEnabled ? "Rollover is currently ON" : "Rollover is OFF"}
          </span>
        </div>

        <div className="settings-actions-row">
          <button
            className="btn primary"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? "Saving..." : "Save Settings"}
          </button>
        </div>
      </div>

      {/* WITHDRAW FEE RULES */}
      <div className="settings-card">
        <h3>Withdraw Fee Rules</h3>
        <p className="muted small">
          Configure withdrawal fees based on amount range.
        </p>

        <table className="table small-table">
          <thead>
            <tr>
              <th>From (₦)</th>
              <th>To (₦)</th>
              <th>Fee (₦)</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {feeRules.map((r, idx) => (
              <tr key={idx}>
                <td>
                  <input
                    className="input tiny"
                    type="number"
                    value={r.min}
                    onChange={(e) =>
                      updateRule(idx, "min", e.target.value)
                    }
                  />
                </td>
                <td>
                  <input
                    className="input tiny"
                    type="number"
                    value={r.max}
                    onChange={(e) =>
                      updateRule(idx, "max", e.target.value)
                    }
                  />
                </td>
                <td>
                  <input
                    className="input tiny"
                    type="number"
                    value={r.fee}
                    onChange={(e) =>
                      updateRule(idx, "fee", e.target.value)
                    }
                  />
                </td>
                <td>
                  <button
                    className="btn danger tiny"
                    onClick={() => deleteRule(idx)}
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <button className="btn ghost" onClick={addRule}>
          + Add Rule
        </button>
      </div>
    </div>
  );
}
