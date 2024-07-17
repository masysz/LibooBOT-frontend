// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDu-0ieXh2EsuWyUT8-_0Ats0KyVIUQfrc",
  authDomain: "liboo-project.firebaseapp.com",
  projectId: "liboo-project",
  storageBucket: "liboo-project.appspot.com",
  messagingSenderId: "39018843470",
  appId: "1:39018843470:web:1f45f4960aad56029d621f"
  
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
console.log("Firebase initialized:", app);
console.log("Firestore initialized:", db);

export { db };
