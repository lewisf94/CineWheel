// ============================================================================
//  Firebase initialisation for CineWheel
// ----------------------------------------------------------------------------
//  This is the ONLY file you need to edit to connect your own Firebase project.
//  Follow README.md (steps 1–6) to get these values, then paste them below.
// ============================================================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-app.js";
import {
  getAuth,
  signInAnonymously,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";
import {
  getFirestore,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  serverTimestamp,
  runTransaction,
  Timestamp,
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";


// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDzN713jEcl5qKB7vsj9z0fLrda7v8TzQQ",
  authDomain: "cinewheel-79636.firebaseapp.com",
  projectId: "cinewheel-79636",
  storageBucket: "cinewheel-79636.firebasestorage.app",
  messagingSenderId: "456572534465",
  appId: "1:456572534465:web:988135022809e23e771e40"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

let app, auth, db;
if (isConfigured) {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
}

// Re-export everything the rest of the app needs, so other modules import from
// one place and we never mismatch SDK versions.
export {
  app,
  auth,
  db,
  signInAnonymously,
  onAuthStateChanged,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  serverTimestamp,
  runTransaction,
  Timestamp,
};
