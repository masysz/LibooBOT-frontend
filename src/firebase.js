// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBXgBykiefZ5oPv8KsAEbrJrFXJNVzJ9Fo",
  authDomain: "apptelebot.firebaseapp.com",
  projectId: "apptelebot",
  storageBucket: "apptelebot.appspot.com",
  messagingSenderId: "464223544142",
  appId: "1:464223544142:web:c3fdb64c21d75439f1f41f"

};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
console.log("Firebase initialized:", app);
console.log("Firestore initialized:", db);

export { db };
