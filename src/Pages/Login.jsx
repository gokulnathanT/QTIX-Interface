import React from "react";
import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "../auth/firebase";
import "../Css/Login.css";
import img from "../assets/glogo.png";

export default function Login({ setUser }) {
  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      setUser(result.user);
      localStorage.removeItem("interviewStartTime");
    } catch (error) {
      console.error("Error logging in with Google: ", error);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2 className="login-title">
          Welcome to <span>QTiX</span>
        </h2>
        <p className="login-subtitle">
          Start your AI-powered interview experience
        </p>
        <button className="google-button" onClick={handleGoogleLogin}>
          <img
            src={img}
            alt="Google Icon"
          />
          Login with Google
        </button>
      </div>
    </div>
  );
}
