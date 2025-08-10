import React, { useEffect, useMemo, useState } from "react";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db, auth } from "../auth/firebase";
import "../Css/Profile.css";

export default function Profile() {
  const [summaries, setSummaries] = useState([]);
  const user = auth.currentUser;
  const userId = user?.uid;
  const userName = user?.displayName || "User";

  useEffect(() => {
    if (!userId) return;

    const fetchUserSummaries = async () => {
      try {
        const summariesRef = collection(db, "users", userId, "interviews");
        const q = query(summariesRef, orderBy("timestamp", "desc"));
        const querySnapshot = await getDocs(q);
        const data = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setSummaries(data);
      } catch (error) {
        console.error("Error fetching summaries:", error);
      }
    };

    fetchUserSummaries();
  }, [userId]);

  const dashboardStats = useMemo(() => {
    if (summaries.length === 0) return null;

    let totalScore = 0;
    let scoreCount = 0;
    const topicFrequency = {};

    summaries.forEach((summary) => {
      summary.topics?.forEach((topic) => {
        topicFrequency[topic] = (topicFrequency[topic] || 0) + 1;
      });

      Object.values(summary.score || {}).forEach((val) => {
        totalScore += Number(val);
        scoreCount++;
      });
    });

    const avgScore = scoreCount ? (totalScore / scoreCount).toFixed(2) : "N/A";
    function durationToSeconds(durationString) {
      console.log(durationString);
      const parts = durationString.split(':').map(Number);
      let totalSeconds = 0;
      totalSeconds = parts[0] * 3600 + parts[1] * 60 + parts[2];
      return totalSeconds;
    }
    let totalSeconds=0;
    for(const duration of summaries.map(item => item.duration)) {
      totalSeconds+=durationToSeconds(duration);
    }
        function secondsToDuration(totalSeconds) {
        const hours = Math.floor(totalSeconds / 3600);
        totalSeconds %= 3600;
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;

        const formattedHours = String(hours).padStart(2, '0');
        const formattedMinutes = String(minutes).padStart(2, '0');
        const formattedSeconds = String(seconds).padStart(2, '0');

        return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
    }

    const TotalDuration=secondsToDuration(totalSeconds);
    console.log("Total Duration:");
    const topTopics = Object.entries(topicFrequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([topic]) => topic);

    return {
      avgScore,
      topTopics,
      TotalDuration:secondsToDuration(totalSeconds)
    };
  }, [summaries]);

  return (
    <div className="profile-container">
      <div className="profile-dashboard">
        <div className="top-bar">
          <div className="title">
            <h2>Welcome, {userName} 👋</h2>
          </div>
          <div className="nav-button">
            <a href="/"> Home 🪦</a>
          </div>
        </div>

        <div className="dashboard-grid">
          <div className="dashboard-card">
            <h4>Total Interviews</h4>
            <p>{summaries.length}</p>
          </div>
          <div className="dashboard-card">
            <h4>Avg. Score</h4>
            <p>{dashboardStats?.avgScore * 10 || "--"}/100</p>
          </div>
          <div className="dashboard-card">
            <h4>Top Topics</h4>
            <p>{dashboardStats?.topTopics?.join(", ") || "--"}</p>
          </div>
          <div className="dashboard-card">
            <h4>Total Duration</h4>
            <p>{dashboardStats?.TotalDuration || "--"}</p>
          </div>
        </div>
      </div>

      <div className="interview-history">
        <h3>History of Interviews</h3>
        {summaries.length === 0 ? (
          <p className="no-interviews">No interviews found...</p>
        ) : (
          <div className="interview-list">
            {summaries.map((item, index) => (
              <article key={item.id} className="interview-card">
                <header>
                  <div className="attempt-number">Attempt {index + 1}</div>
                  <div className="attempt-chip">{item.duration}</div>
                </header>
                <section className="card-content">
                  <p>
                    <span className="label">Topics:</span>
                    <span className="value">{item.topics?.join(", ")}</span>
                  </p>
                  <p>
                    <span className="label">Summary:</span>
                    <span className="value">{item.summary}</span>
                  </p>
                </section>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
