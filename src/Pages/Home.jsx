import React, { useEffect } from "react";
import Interview from "./Interview";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Login from "./Login";
import "../Css/Home.css";
import Landing from "./Landing";
import { onAuthStateChanged } from "firebase/auth";

import { auth } from "../auth/firebase";
import { signOut } from "firebase/auth";


export default function Home() {
  const [user, setUser] = useState(null);
  const [isLandingComplete, setIsLandingComplete] = useState(false);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);
  if (loading) return <div>Loading...</div>;
  const handleLogout = async () => {
    try {
      await signOut(auth);
      setIsLandingComplete(false);
      localStorage.clear();
      setUser(null);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };
  const handleProfile = () => {
    navigate("/Profile");
  };

  return (
    <div className="home-container">
      <div className="topBar">
        <div>
          <p style={{ color: "lightsteelblue" }}>
            <span className="topbar-name">Q T I X</span>
          </p>
        </div>
        <div className="login">
          {user ? (
            <div className="dropdown">
              <button
                onClick={() => setOpen(!open)}
                className="dropdown-button"
              >
                ☰
              </button>
              {open && (
                <ul className="dropdown-menu">
                  <li>{user.displayName}</li>
                  <li onClick={handleProfile}>Profile</li>
                  <li onClick={handleLogout}>Logout</li>
                  {/* {!interviewStarted && <></>} */}
                </ul>
              )}
            </div>
          ) : (
            <div className="dropdown">
              <div className="dropdown-button">
                <p>!Logged</p>
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="home-content">
        {!user ? (
          <Login setUser={setUser} />
        ) : (
          <Landing  />
        )}
      </div>
    </div>
  );
}
