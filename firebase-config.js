import { initializeApp } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";

import {
  getAuth,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  signInAnonymously,
  sendPasswordResetEmail,
  deleteUser,
  EmailAuthProvider,
  reauthenticateWithCredential
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";

import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";

import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-storage.js";

import {
  getDatabase,
  ref as databaseRef,
  set as databaseSet,
  onValue as databaseOnValue,
  onDisconnect,
  serverTimestamp as databaseServerTimestamp
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-database.js";


/* =========================================================
   KMEET FIREBASE CONFIGURATION
   ========================================================= */

const firebaseConfig = {
  apiKey: "AIzaSyDgRaeK8CnCpHyxaIE7MaspmRinswwsrNo",
  authDomain: "kmeet-database.firebaseapp.com",
  projectId: "kmeet-database",
  storageBucket: "kmeet-database.firebasestorage.app",
  messagingSenderId: "123313610325",
  appId: "1:123313610325:web:255c467996eff14d72bedc",
  databaseURL: "https://kmeet-database-default-rtdb.europe-west1.firebasedatabase.app"
};


/* =========================================================
   INITIALIZE FIREBASE
   ========================================================= */

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const db = getFirestore(app);

const storage = getStorage(app);

const database = getDatabase(app);


/* =========================================================
   EXPORT EVERYTHING USED BY KMEET
   ========================================================= */

export {
  /* Firebase app */
  app,

  /* Authentication */
  auth,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  signInAnonymously,
  sendPasswordResetEmail,
  deleteUser,
  EmailAuthProvider,
  reauthenticateWithCredential,

  /* Firestore */
  db,
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,

  /* Storage */
  storage,
  ref,
  uploadBytes,
  getDownloadURL,

  /* Realtime Database */
  database,
  databaseRef,
  databaseSet,
  databaseOnValue,
  onDisconnect,
  databaseServerTimestamp
};
