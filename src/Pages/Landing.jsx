import React from "react";
import "../Css/Landing.css";
import img from "../assets/booster.png";
import { useState } from "react";
import { useNavigate } from "react-router-dom";


export default function Landing() {

   const navigate=useNavigate();
   const handleStartInterview=()=>{
      navigate("/Interview");
      localStorage.clear();
   }

  return (
    <div className="landing-container">
      <div className="landing-overlay">
        <div className="glow-sphere"></div>
        <div className="landing-card-left">
          <h1 className="title">
            Welcome to <span className="brand">QTiX </span>
          </h1>
          <p className="subtitle">
            Your surreal, AI-powered interview simulator.
          </p>
          <a className="cta-button" onClick={handleStartInterview}>
            Begin Interview &nbsp;
            <img src={img} alt="booster" />
          </a>
        </div>
        <div className="landing-card-right">
          <ul className="feature-list">
            <li>🎙️ Talk or type — interact with AI in real time</li>
            <li>💬 Realistic interviewer that adapts and follows up</li>
            <li>🧠 Built-in code editor with instant AI feedback</li>
            <li>📊 Get auto scores and a full performance summary</li>
          </ul>
        </div>
      </div>
      <div className="footer-credit">Made with ❤️ by Gokul</div>
    </div>
  );
}

