// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Splash from "./pages/Splash";
import Login from "./pages/AdminLogin";
import Layout from "./layout/Layout";
import Dashboard from "./pages/Dashboard";

import Pools from "./pages/Pools";
import PoolDetails from "./pages/PoolDetails";

import Users from "./pages/Users";
import UserView from "./pages/UserView";

import Transactions from "./pages/Transactions";
import TransactionView from "./pages/TransactionView";
import Wallets from "./pages/Wallets";
import WalletView from "./pages/WalletView";
import Kyc from "./pages/Kyc";
import Deposits from "./pages/Deposits";
import PendingDeposits from "./pages/PendingDeposits";
import ExpireDeposits from "./pages/ExpireDeposits";
import Withdrawals from "./pages/Withdrawals";
import WinnerTicker from "./pages/WinnerTicker";
import Billboards from "./pages/Billboards";
import AuditLogs from "./pages/AuditLogs";
import Settings from "./pages/Settings";

function App() {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Splash />} />
        <Route path="/login" element={<Login />} />

        {/* Admin routes with Layout */}
        <Route path="/dashboard" element={<Layout />}>
          <Route index element={<Dashboard />} /> {/* /dashboard */}
          
                
          {/* pools */}
       
<Route path="pools" element={<Pools />} />
<Route path="pools/:id" element={<PoolDetails />} />

         
          {/* Users */}
          <Route path="users" element={<Users />} /> {/* /dashboard/users */}
          <Route path="users/:id" element={<UserView />} /> {/* /dashboard/users/:id */}

        {/* transactions/wallets */}
<Route path="transactions" element={<Transactions />} />               {/* /dashboard/transactions */}
<Route path="transactions/:id" element={<TransactionView />} />    {/* /dashboard/transactions/123 */}
<Route path="wallets" element={<Wallets />} />                       {/* /dashboard/wallets */}
<Route path="wallets/:id" element={<WalletView />} /> 

<Route path="kyc" element={<Kyc />} />
<Route path="deposits" element={<Deposits />} />
<Route path="deposits_pending" element={<PendingDeposits />} />
<Route path="deposits_expire" element={<ExpireDeposits />} />


<Route path="withdrawals" element={<Withdrawals />} />


<Route path="billboards" element={<Billboards />} />
<Route path="winner-ticker" element={<WinnerTicker />} />
<Route path="audit" element={<AuditLogs />} />

<Route path="settings" element={<Settings />} />


        </Route>
      </Routes>
    </Router>
  );
}

export default App;
