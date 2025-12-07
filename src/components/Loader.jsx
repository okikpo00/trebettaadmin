// src/components/Loader.jsx
import React from "react";
import "../css/Shared.css";

export default function Loader() {
  return (
    <div className="loader-wrap">
      <div className="loader" />
      <div className="muted">Loading...</div>
    </div>
  );
}
