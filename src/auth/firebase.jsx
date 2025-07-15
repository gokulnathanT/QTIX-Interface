

// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";


const firebaseConfig = {
  apiKey: "AIzaSyCze0KBnwl87r3bBAotyfonMlrDooARTCw",
  authDomain: "qtix-userdata.firebaseapp.com",
  projectId: "qtix-userdata",
  storageBucket: "qtix-userdata.firebasestorage.app",
  messagingSenderId: "983499432946",
  appId: "1:983499432946:web:b700d207345233b86ec16b",
  measurementId: "G-XFX8J2BL1V",
};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const db=getFirestore(app);

export { auth, provider ,db};
