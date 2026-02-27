import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCknfyW6f88t3I3Q7GlOMOrzdCVY2j3H6U",
  authDomain: "skillmatch-f8f94.firebaseapp.com",
  projectId: "skillmatch-f8f94",
  storageBucket: "skillmatch-f8f94.firebasestorage.app",
  messagingSenderId: "251447305979",
  appId: "1:251447305979:web:53b90a0558a8b8d88ef25e"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);