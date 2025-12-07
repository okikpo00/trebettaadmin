// src/components/Toast.jsx
import React, { useEffect } from "react";
import "../css/Shared.css";

export default function Toast({ type = "info", message = "", onClose = ()=>{} , duration = 3500 }) {
  useEffect(() => {
    if (!message) return;
    const t = setTimeout(()=> onClose(), duration);
    return ()=> clearTimeout(t);
  }, [message, duration, onClose]);

  return (
    <div className={`toast ${type}`}>
      <div className="toast-message">{message}</div>
      <button className="toast-close" onClick={onClose}>×</button>
    </div>
  );
}
