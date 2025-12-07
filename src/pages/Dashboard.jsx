// src/pages/Dashboard.jsx
import React, { useEffect, useState, useCallback } from "react";
import api from "../api";
import "../css/dashboard.css";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from "recharts";

// Small helper: animate numbers (simple count-up)
function useAnimatedNumber(target, duration = 600) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (target == null) return;

    let start = 0;
    let startTime = null;
    const t = Number(target) || 0;

    function step(timestamp) {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const current = start + (t - start) * progress;
      setValue(current);
      if (progress < 1) {
        requestAnimationFrame(step);
      }
    }

    requestAnimationFrame(step);
  }, [target, duration]);

  return value;
}

// Format helpers
function formatCurrency(n) {
  const num = Number(n) || 0;
  return `₦${num.toLocaleString()}`;
}

function formatInt(n) {
  const num = Number(n) || 0;
  return num.toLocaleString();
}

// KPI Card
function KpiCard({ label, value, isMoney, loading }) {
  const animated = useAnimatedNumber(!loading ? Number(value) || 0 : 0);

  return (
    <div className={`kpi-card ${loading ? "loading" : ""}`}>
      <div className="kpi-label">{label}</div>
      <div className="kpi-value">
        {loading ? (
          <div className="kpi-skeleton" />
        ) : (
          <span>{isMoney ? formatCurrency(animated) : formatInt(animated)}</span>
        )}
      </div>
    </div>
  );
}

// Card wrapper for sections
function SectionCard({ title, subtitle, right, children, full }) {
  return (
    <div className={`section-card ${full ? "full" : ""}`}>
      <div className="section-head">
        <div>
          <h3>{title}</h3>
          {subtitle && <small className="muted">{subtitle}</small>}
        </div>
        {right && <div>{right}</div>}
      </div>
      <div className="section-body">{children}</div>
    </div>
  );
}

// Map chart series with fallback
function safeSeries(arr) {
  return Array.isArray(arr) ? arr : [];
}

export default function Dashboard() {
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOverview = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/admin/dashboard/overview");
      const data = res.data?.data ?? res.data;
      setOverview(data || null);
      console.log("Dashboard overview:", data);
    } catch (err) {
      console.error("dashboard overview err", err);
      setError(err.response?.data?.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOverview();
  }, [fetchOverview]);

  const charts = overview?.charts || {};
  const kyc = overview?.kyc || {};
  const poolsByStatus = overview?.poolsByStatus || {};
  const withdrawals = overview?.withdrawals || {};
  const companyCut = overview?.companyCut || {};
  const rollover = overview?.rollover || {};

  // KYC donut data
  const kycData = [
    { name: "Pending", value: Number(kyc.pending || 0), color: "#fbbf24" },
    { name: "Approved", value: Number(kyc.approved || 0), color: "#16a34a" },
    { name: "Rejected", value: Number(kyc.rejected || 0), color: "#dc2626" },
  ];

  // Pool status chips mapping
  const statusOrder = [
    "open",
    "locked",
    "settled",
    "rollover",
    "refunded",
  ];

  const withdrawals7d = safeSeries(charts.withdrawals7d);
  const deposits7d = safeSeries(charts.deposits7d);
  const newUsers7d = safeSeries(charts.newUsers7d);
  const pools7d = safeSeries(charts.pools7d);

  const hasError = !!error;

  return (
    <div className="dashboard container">
      <div className="dash-header">
        <div>
          <h1>Trebetta Admin Dashboard</h1>
          <p className="muted">
            CEO view of users, wallets, pools, KYC, and flows.
          </p>
        </div>
        <div className="dash-actions">
          <button className="btn ghost" onClick={fetchOverview} disabled={loading}>
            {loading ? "Refreshing..." : "Reload"}
          </button>
        </div>
      </div>

      {hasError && <div className="alert error">{error}</div>}

      {/* KPI ROW */}
      <section className="kpi-row">
        <KpiCard
          label="Total Users"
          value={overview?.totalUsers}
          loading={loading}
        />
        <KpiCard
          label="Total Wallet Balance"
          value={overview?.totalWalletBalance}
          isMoney
          loading={loading}
        />
        <KpiCard
          label="Total Deposits"
          value={overview?.totalDeposits}
          isMoney
          loading={loading}
        />
        <KpiCard
          label="Total Withdrawals"
          value={overview?.totalWithdrawals}
          isMoney
          loading={loading}
        />
        <KpiCard
          label="Active Pools"
          value={overview?.activePools}
          loading={loading}
        />
        <KpiCard
          label="New Users (24h)"
          value={overview?.newUsers24h}
          loading={loading}
        />
      </section>

      {/* FINANCIAL ANALYTICS ROW */}
      <section className="grid-2">
        <SectionCard
          title="Company Cut"
          subtitle="Lifetime & last 30 days"
        >
          <div className="finance-grid">
            <div className="finance-metrics">
              <div>
                <small className="muted">Lifetime Company Cut</small>
                <div className="big-number">
                  {formatCurrency(companyCut.total || 0)}
                </div>
              </div>
              <div>
                <small className="muted">Last 30 Days</small>
                <div className="big-number">
                  {formatCurrency(companyCut.last30Days || 0)}
                </div>
              </div>
            </div>
            <div className="finance-chart">
              {/* We only have 2 points (total vs last30Days), so we fake a
                  mini series to show a small trend line */}
              <ResponsiveContainer width="100%" height={140}>
                <AreaChart
                  data={[
                    { label: "Past", value: Number(companyCut.total || 0) - Number(companyCut.last30Days || 0) },
                    { label: "Last 30d", value: Number(companyCut.last30Days || 0) },
                  ]}
                  margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="cutGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#7c0a02" stopOpacity={0.6} />
                      <stop offset="95%" stopColor="#7c0a02" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="label" />
                  <YAxis hide />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#7c0a02"
                    fillOpacity={1}
                    fill="url(#cutGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </SectionCard>

        <SectionCard
          title="Rollover Pool"
          subtitle="Current rollover balance & historical applied"
        >
          <div className="rollover-grid">
            <div>
              <small className="muted">Current Balance</small>
              <div className="big-number">
                {formatCurrency(rollover.current_balance || 0)}
              </div>
            </div>
            <div>
              <small className="muted">Total Rollover Applied</small>
              <div className="big-number">
                {formatCurrency(rollover.total_applied || 0)}
              </div>
            </div>
          </div>
        </SectionCard>
      </section>

      {/* WALLET FLOW CHARTS */}
      <section className="grid-2">
        <SectionCard
          title="Deposits (Last 7 Days)"
          subtitle="Daily deposit volume"
        >
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={deposits7d}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="date" tickFormatter={(d) => new Date(d).toLocaleDateString()} />
              <YAxis />
              <Tooltip
                labelFormatter={(d) => new Date(d).toLocaleString()}
                formatter={(value) => [formatCurrency(value), "Amount"]}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#7c0a02"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </SectionCard>

        <SectionCard
          title="Withdrawals (Last 7 Days)"
          subtitle="Daily withdrawal volume"
        >
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={withdrawals7d}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="date" tickFormatter={(d) => new Date(d).toLocaleDateString()} />
              <YAxis />
              <Tooltip
                labelFormatter={(d) => new Date(d).toLocaleString()}
                formatter={(value) => [formatCurrency(value), "Amount"]}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#374151"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </SectionCard>
      </section>

      {/* USER & POOL CHARTS */}
      <section className="grid-2">
        <SectionCard
          title="New Users (Last 7 Days)"
          subtitle="Daily registrations"
        >
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={newUsers7d}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="date" tickFormatter={(d) => new Date(d).toLocaleDateString()} />
              <YAxis />
              <Tooltip
                labelFormatter={(d) => new Date(d).toLocaleString()}
                formatter={(value) => [formatInt(value), "Users"]}
              />
              <Bar
                dataKey="value"
                radius={[8, 8, 0, 0]}
                fill="#e3c465"
              />
            </BarChart>
          </ResponsiveContainer>
        </SectionCard>

        <SectionCard
          title="Pools Created (Last 7 Days)"
          subtitle="Daily pool creation"
        >
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={pools7d}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="date" tickFormatter={(d) => new Date(d).toLocaleDateString()} />
              <YAxis />
              <Tooltip
                labelFormatter={(d) => new Date(d).toLocaleString()}
                formatter={(value) => [formatInt(value), "Pools"]}
              />
              <Bar
                dataKey="value"
                radius={[8, 8, 0, 0]}
                fill="#7c0a02"
              />
            </BarChart>
          </ResponsiveContainer>
        </SectionCard>
      </section>

      {/* KYC + WITHDRAWALS */}
      <section className="grid-2">
        <SectionCard
          title="KYC Snapshot"
          subtitle="Overview of verification status"
        >
          <div className="kyc-grid">
            <div className="kyc-metrics">
              <div>
                <small className="muted">Pending</small>
                <div className="big-number">
                  {formatInt(kyc.pending || 0)}
                </div>
              </div>
              <div>
                <small className="muted">Approved</small>
                <div className="big-number">
                  {formatInt(kyc.approved || 0)}
                </div>
              </div>
              <div>
                <small className="muted">Rejected</small>
                <div className="big-number">
                  {formatInt(kyc.rejected || 0)}
                </div>
              </div>
            </div>

            <div className="kyc-chart">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={kycData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                  >
                    {kycData.map((item, idx) => (
                      <Cell key={idx} fill={item.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value, name) => [formatInt(value), name]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </SectionCard>

        <SectionCard
          title="Withdrawal Monitor"
          subtitle="Pending withdrawals health"
          right={
            withdrawals.pending_count > 5 ? (
              <span className="warning-dot">High pending</span>
            ) : null
          }
        >
          <div className="withdrawal-grid">
            <div>
              <small className="muted">Pending Count</small>
              <div className="big-number">
                {formatInt(withdrawals.pending_count || 0)}
              </div>
            </div>
            <div>
              <small className="muted">Pending Amount</small>
              <div className="big-number">
                {formatCurrency(withdrawals.pending_amount || 0)}
              </div>
            </div>
          </div>

          <div className="withdrawal-sparkline">
            <ResponsiveContainer width="100%" height={80}>
              <LineChart data={withdrawals7d}>
                <XAxis dataKey="date" hide />
                <YAxis hide />
                <Tooltip
                  labelFormatter={(d) => new Date(d).toLocaleString()}
                  formatter={(value) => [formatCurrency(value), "Amount"]}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#7c0a02"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>
      </section>

      {/* POOL STATUS SUMMARY */}
      <section>
        <SectionCard
          title="Pools Status Summary"
          subtitle="Distribution by lifecycle state"
          full
        >
          <div className="status-chips">
            {statusOrder.map((status) => {
              const count = poolsByStatus[status] ?? 0;
              return (
                <div key={status} className="status-chip">
                  <span className="dot" />
                  <span className="label">{status}</span>
                  <span className="count">{formatInt(count)}</span>
                </div>
              );
            })}
          </div>
        </SectionCard>
      </section>
    </div>
  );
}
