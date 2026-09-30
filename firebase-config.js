import {
  initializeApp
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";

import {
  getAuth,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  signInAnonymously,
  sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";

import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
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


// Initialize Firebase
const app = initializeApp(firebaseConfig);


// Authentication
const auth = getAuth(app);


// Firestore
const db = getFirestore(app);


// Cloud Storage
const storage = getStorage(app);


// Realtime Database
const database = getDatabase(app);


export {
  // Firebase
  app,

  // Authentication
  auth,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  signInAnonymously,
  sendPasswordResetEmail,

  // Firestore
  db,
  doc,
  getDoc,
  setDoc,
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,

  // Storage
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
