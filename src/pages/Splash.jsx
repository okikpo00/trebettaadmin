// src/pages/Splash.jsx
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../css/splash.css";

const Splash = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/login");
    }, 2500); // after 2.5s go to login
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="splash-container">
      <h1 className="splash-text">TREBETTA ADMIN</h1>
    </div>
  );
};

export default Splash;
