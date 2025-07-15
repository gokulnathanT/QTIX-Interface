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

  // Calculate average score, top topics, etc.
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

    const topTopics = Object.entries(topicFrequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([topic]) => topic);

    return {
      avgScore,
      topTopics,
    };
  }, [summaries]);

  return (
    <div className="profile-container">
      {/* Top Dashboard Section */}
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
            <p>{dashboardStats?.avgScore || "--"}/10</p>
          </div>
          <div className="dashboard-card">
            <h4>Top Topics</h4>
            <p>{dashboardStats?.topTopics?.join(", ") || "--"}</p>
          </div>
          <div className="dashboard-card">
            <h4>Last Duration</h4>
            <p>{summaries[0]?.duration || "--"}</p>
          </div>
        </div>
      </div>

      {/* Scrollable Interview History */}
      <div className="interview-history">
        <h3>History of Interviews</h3>
        {summaries.length === 0 ? (
          <p>No interviews found...</p>
        ) : (
          <div className="interview-list">
            {summaries.map((item, index) => (
              <div key={item.id} className="interview-card">
                <h4>Attempt {index + 1}</h4>
                <p>
                  <strong>Topics:</strong> {item.topics?.join(", ")}
                </p>
                <p>
                  <strong>Duration:</strong> {item.duration}
                </p>
                <p>
                  <strong>Summary:</strong> {item.summary}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
