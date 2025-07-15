import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../auth/firebase";
import React from "react";

export  async function SaveSummary(
  userId,
  topics,
  score,
  summary,
  duration
) {
  if (!userId) return;
  try {
    const userRef = collection(db, "users", userId, "interviews");

    await addDoc(userRef, {
      topics,
      score,
      summary,
      duration,
      timestamp: serverTimestamp(),
    });
    console.log("Summary saved");
  } catch (error) {
    console.error("Error saving summary : ", error);
  }
  return;
}
