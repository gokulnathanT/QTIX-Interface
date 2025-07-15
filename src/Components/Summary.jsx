import React, { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import "../Css/Summary.css";
import {SaveSummary} from "../Components/SaveSummary";
import {auth} from "../auth/firebase";

export default function Summary() {
  const location = useLocation();
  const data = JSON.parse(location.state.Summary);

  const { topics, score, summary } = data;
  const duration=location.state.duration;
  const userId=auth.currentUser?.uid;
  const scores = Object.entries(score);
  const hasSavedRef=useRef(false);
  useEffect(()=>{
    if (userId && !hasSavedRef.current) {
      SaveSummary(userId, topics, score, summary, duration);
      hasSavedRef.current=true;
    }
  },[userId]);
  console.log("Summary Data:", data);

  return (
    <div className="summary-container">
      <div className="summary-glass-box">
        <h2 className="summary-title"> Interview Summary</h2>
        <div className="summary-content-wrapper">
          <section className="summary-section">
            <h3 className="section-heading"> Topics 👾</h3>
            <ul className="summary-topics-list">
              {topics.map((topic, index) => (
                <li key={index} className="summary-topics">
                  {topic}
                </li>
              ))}
            </ul>
          </section>

          <section className="summary-section">
            <h3 className="section-heading">Performance Scores 🗿</h3>
            <ul className="summary-list">
              {scores.map(([key, value], index) => (
                <li key={index} className="summary-item">
                  <strong>{key}</strong>: {value}/10
                </li>
              ))}
            </ul>
          </section>
        </div>

        <div className="summary-right-panel">
          <section className="summary-section">
            <h3 className="section-heading">Feedback & Recommendations 📌</h3>
            <p className="summary-paragraph">{summary}</p>
          </section>
        </div>
        <div className="summary-duration">
          <div className="duration-icon">⏱️</div>
          <div className="duration-content">
            <h3 className="duration-heading">Interview Duration</h3>
            <p className="duration-text">{duration}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
