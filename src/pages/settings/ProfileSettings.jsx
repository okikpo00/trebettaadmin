// src/pages/settings/ProfileSettings.jsx
import React, { useEffect, useState } from "react";
import api from "../../api";
import "../../css/Settings.css";

export default function ProfileSettings() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const [editOpen, setEditOpen] = useState(false);
  const [pwdOpen, setPwdOpen] = useState(false);

  const [editForm, setEditForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
  });

  const [pwdForm, setPwdForm] = useState({
    old_password: "",
    new_password: "",
    confirm_password: "",
  });

  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPwd, setSavingPwd] = useState(false);

  // ensure session header is always set
  useEffect(() => {
    const sessionId = localStorage.getItem("admin_session_id");
    if (sessionId) {
      api.defaults.headers.common["x-admin-session-id"] = sessionId;
    }
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/me");
      const data = res.data?.data ?? res.data;
      setProfile(data);
    } catch (err) {
      console.error("profile fetch error", err);
      alert(err.response?.data?.message || "Failed to load admin profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const openEdit = () => {
    if (!profile) return;
    setEditForm({
      first_name: profile.first_name || "",
      last_name: profile.last_name || "",
      email: profile.email || "",
    });
    setEditOpen(true);
  };

  const handleProfileSave = async () => {
    if (!editForm.email.trim()) return alert("Email is required");
    setSavingProfile(true);
    try {
      await api.put("/admin/me/update", {
        first_name: editForm.first_name || null,
        last_name: editForm.last_name || null,
        email: editForm.email.trim(),
      });
      alert("Profile updated");
      setEditOpen(false);
      fetchProfile();
    } catch (err) {
      console.error("profile update error", err);
      alert(err.response?.data?.message || "Failed to update profile");
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordChange = async () => {
    if (!pwdForm.old_password || !pwdForm.new_password) {
      return alert("Both old and new password are required");
    }
    if (pwdForm.new_password !== pwdForm.confirm_password) {
      return alert("New password and confirm password do not match");
    }
    setSavingPwd(true);
    try {
      await api.post("/admin/me/change-password", {
        old_password: pwdForm.old_password,
        new_password: pwdForm.new_password,
      });
      alert("Password changed successfully");
      setPwdOpen(false);
      setPwdForm({ old_password: "", new_password: "", confirm_password: "" });
    } catch (err) {
      console.error("password change error", err);
      alert(err.response?.data?.message || "Failed to change password");
    } finally {
      setSavingPwd(false);
    }
  };

  if (loading) {
    return <div className="settings-card">Loading profile...</div>;
  }

  if (!profile) {
    return <div className="settings-card">Profile not found</div>;
  }

  return (
    <div className="settings-grid">
      <div className="settings-card">
        <h3>Profile</h3>
        <p className="muted small">
          Basic info for your admin account.
        </p>

        <div className="settings-field-row">
          <span className="field-label">Username</span>
          <span className="field-value">{profile.username}</span>
        </div>

        <div className="settings-field-row">
          <span className="field-label">Email</span>
          <span className="field-value">{profile.email}</span>
        </div>

        <div className="settings-field-row">
          <span className="field-label">Name</span>
          <span className="field-value">
            {(profile.first_name || "") + " " + (profile.last_name || "")}
          </span>
        </div>

        <div className="settings-field-row">
          <span className="field-label">Role</span>
          <span className="field-value">{profile.role || "admin"}</span>
        </div>

        <div className="settings-field-row">
          <span className="field-label">Status</span>
          <span className="field-value">{profile.status || "active"}</span>
        </div>

        <div className="settings-field-row">
          <span className="field-label">Last login</span>
          <span className="field-value">
            {profile.last_login
              ? new Date(profile.last_login).toLocaleString()
              : "—"}
          </span>
        </div>

        <div className="settings-actions-row">
          <button className="btn" onClick={openEdit}>
            Edit Profile
          </button>
          <button className="btn ghost" onClick={() => setPwdOpen(true)}>
            Change Password
          </button>
        </div>
      </div>

      {/* Modals */}
      {editOpen && (
        <div className="modal-overlay">
          <div className="modal-card">
            <h3>Edit Profile</h3>

            <div className="form-row">
              <label>First name</label>
              <input
                className="input"
                value={editForm.first_name}
                onChange={(e) =>
                  setEditForm((f) => ({ ...f, first_name: e.target.value }))
                }
              />
            </div>
            <div className="form-row">
              <label>Last name</label>
              <input
                className="input"
                value={editForm.last_name}
                onChange={(e) =>
                  setEditForm((f) => ({ ...f, last_name: e.target.value }))
                }
              />
            </div>
            <div className="form-row">
              <label>Email</label>
              <input
                className="input"
                type="email"
                value={editForm.email}
                onChange={(e) =>
                  setEditForm((f) => ({ ...f, email: e.target.value }))
                }
              />
            </div>

            <div className="modal-actions">
              <button
                className="btn ghost"
                onClick={() => setEditOpen(false)}
                disabled={savingProfile}
              >
                Cancel
              </button>
              <button
                className="btn primary"
                onClick={handleProfileSave}
                disabled={savingProfile}
              >
                {savingProfile ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}

      {pwdOpen && (
        <div className="modal-overlay">
          <div className="modal-card">
            <h3>Change Password</h3>

            <div className="form-row">
              <label>Current password</label>
              <input
                className="input"
                type="password"
                value={pwdForm.old_password}
                onChange={(e) =>
                  setPwdForm((f) => ({ ...f, old_password: e.target.value }))
                }
              />
            </div>
            <div className="form-row">
              <label>New password</label>
              <input
                className="input"
                type="password"
                value={pwdForm.new_password}
                onChange={(e) =>
                  setPwdForm((f) => ({ ...f, new_password: e.target.value }))
                }
              />
            </div>
            <div className="form-row">
              <label>Confirm new password</label>
              <input
                className="input"
                type="password"
                value={pwdForm.confirm_password}
                onChange={(e) =>
                  setPwdForm((f) => ({
                    ...f,
                    confirm_password: e.target.value,
                  }))
                }
              />
            </div>

            <div className="modal-actions">
              <button
                className="btn ghost"
                onClick={() => setPwdOpen(false)}
                disabled={savingPwd}
              >
                Cancel
              </button>
              <button
                className="btn primary"
                onClick={handlePasswordChange}
                disabled={savingPwd}
              >
                {savingPwd ? "Updating..." : "Update Password"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
