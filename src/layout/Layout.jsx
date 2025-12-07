import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import "../css/Layout.css";

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="layout">
      <Sidebar isOpen={sidebarOpen} toggle={() => setSidebarOpen(!sidebarOpen)} />
      <div className="main">
        <Topbar toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <div className="content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
