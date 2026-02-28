import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyADqPW8QDBLprVrJZA0V6Gt1XgU-5Kn5w8",
  authDomain: "gemini-240d5.firebaseapp.com",
  projectId: "gemini-240d5",
  storageBucket: "gemini-240d5.firebasestorage.app",
  messagingSenderId: "268015284706",
  appId: "1:268015284706:web:1bffbe0fb8d6f1cd3489bb",
  measurementId: "G-GLBDQBZTE2",
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);

// Analytics — only in browser environments
isSupported().then((supported) => {
  if (supported) getAnalytics(app);
});

export default app;
