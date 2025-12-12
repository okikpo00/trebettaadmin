import React from "react";
import { Link } from "react-router-dom";
import "../css/Sidebar.css";

export default function Sidebar({ isOpen, toggle }) {
  return (
    <div className={`sidebar ${isOpen ? "open" : "closed"}`}>
      <button className="toggle-btn" onClick={toggle}>
        ☰
      </button>
      <nav>
        <ul>
          <li><Link to="/dashboard">Dashboard</Link></li>
          <li><Link to="/dashboard/pools">Pools</Link></li>
          <li><Link to="/dashboard/users">Users</Link></li>
          <li><Link to="/dashboard/transactions">Transactions</Link></li>
          <li><Link to="/dashboard/wallets">Wallets</Link></li>
          <li><Link to="/dashboard/kyc">Kyc</Link></li>
          <li><Link to="/dashboard/deposits">Deposits</Link></li>
            <li><Link to="/dashboard/deposits_pending">PendingDeposits</Link></li>
              <li><Link to="/dashboard/deposits_expire">ExpireDeposits</Link></li>
          <li><Link to="/dashboard/withdrawals">Withdrawals</Link></li>
          <li><Link to="/dashboard/notifications">Notifications</Link></li>
           <li><Link to="/dashboard/audit">AuditLogs</Link></li>
          <li><Link to="/dashboard/billboards">billboards</Link></li>
            <li><Link to="/dashboard/winner-ticker">winner-ticker</Link></li>
               <li><Link to="/dashboard/settings">settings</Link></li>
        </ul>
      </nav>
    </div>
  );
}
