// src/pages/AdminLogin.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import "../css/adminlogin.css";

export default function AdminLogin() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please fill in both fields.");
      return;
    }

    try {
      setLoading(true);

      const res = await api.post("/admin/auth/login", { email, password });

      console.log("Admin login response:", res.data);

      const { token, session_id, admin } = res.data;

      if (!admin || admin.role !== "admin") {
        setError("Access denied. Admins only.");
        return;
      }

      // SAVE TO LOCAL STORAGE
      localStorage.setItem("admin_token", token);
      localStorage.setItem("admin_session_id", session_id);
      localStorage.setItem("admin_user", JSON.stringify(admin));

      // SET AXIOS DEFAULT HEADERS
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      api.defaults.headers.common["x-admin-session-id"] = session_id;

      // REDIRECT
      navigate("/dashboard");

    } catch (err) {
      console.error("Admin login error:", err);
      setError(err.response?.data?.message || "Login failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleSubmit}>
        <h2>Admin Login</h2>

        {error && <div className="error-text">{error}</div>}

        <input
          type="text"
          name="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="input"
        />

        <input
          type="password"
          name="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="input"
        />

        <button className="btn" type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>

        <div className="extra-links">
          <button
            type="button"
            className="link-btn"
            onClick={() => alert("Forgot Password (coming soon)")}
          >
            Forgot Password?
          </button>
        </div>
      </form>
    </div>
  );
}


