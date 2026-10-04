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
  deleteUser
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


const firebaseConfig = {
  apiKey: "AIzaSyDgRaeK8CnCpHyxaIE7MaspmRinswwsrNo",
  authDomain: "kmeet-database.firebaseapp.com",
  projectId: "kmeet-database",
  storageBucket: "kmeet-database.firebasestorage.app",
  messagingSenderId: "123313610325",
  appId: "1:123313610325:web:255c467996eff14d72bedc",
  databaseURL: "https://kmeet-database-default-rtdb.europe-west1.firebasedatabase.app"
};


const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const db = getFirestore(app);

const storage = getStorage(app);

const database = getDatabase(app);


export {
  app,

  // Firebase Authentication
  auth,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  signInAnonymously,
  sendPasswordResetEmail,
  deleteUser,

  // Firestore
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

  // Firebase Storage
  storage,
  ref,
  uploadBytes,
  getDownloadURL,

  // Realtime Database
  database,
  databaseRef,
  databaseSet,
  databaseOnValue,
  onDisconnect,
  databaseServerTimestamp
};
