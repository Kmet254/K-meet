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
  remove as databaseRemove,
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
   KMEET GLOBAL PRESENCE SYSTEM
   =========================================================
   
   This runs automatically whenever this Firebase config is
   imported by a Kmeet page.

   Logged-in members are registered at:

   status/{uid}/connections/{connectionId}

   Discover listens to that location to determine whether
   a member is currently online.

   Anonymous users are NOT marked as online members.

   Each browser tab gets its own connection ID, so multiple
   browsers/tabs can be online at the same time safely.
   ========================================================= */

const presenceConnectionId =
  `${Date.now()}-${Math.random().toString(36).slice(2)}-${Math.random()
    .toString(36)
    .slice(2)}`;

let currentPresenceUid = null;
let currentPresenceConnectionRef = null;
let currentPresenceLastOnlineRef = null;
let presenceConnectedUnsubscribe = null;
let presenceStarting = false;


/* ---------------------------------------------------------
   Remove this browser's previous presence connection
   --------------------------------------------------------- */

async function removeCurrentPresence() {
  if (!currentPresenceConnectionRef) {
    return;
  }

  try {
    await databaseRemove(currentPresenceConnectionRef);
  } catch (error) {
    console.warn(
      "Kmeet could not remove previous presence connection:",
      error
    );
  }

  currentPresenceConnectionRef = null;
  currentPresenceLastOnlineRef = null;
  currentPresenceUid = null;
}


/* ---------------------------------------------------------
   Start presence for a logged-in Kmeet member
   --------------------------------------------------------- */

async function startGlobalPresence(user) {

  /* Anonymous users are never counted as online members */
  if (
    !user ||
    user.isAnonymous ||
    !user.uid
  ) {
    return;
  }

  /* Prevent duplicate startup for the same user */
  if (
    currentPresenceUid === user.uid &&
    currentPresenceConnectionRef
  ) {
    return;
  }

  if (presenceStarting) {
    return;
  }

  presenceStarting = true;

  try {

    /* If another user was previously active in this page,
       remove that old presence first. */
    if (
      currentPresenceUid &&
      currentPresenceUid !== user.uid
    ) {
      await removeCurrentPresence();
    }

    currentPresenceUid = user.uid;

    const connectedRef = databaseRef(
      database,
      ".info/connected"
    );

    /*
     * Create one unique connection reference for this
     * browser/tab.
     */
    currentPresenceConnectionRef = databaseRef(
      database,
      `status/${user.uid}/connections/${presenceConnectionId}`
    );

    currentPresenceLastOnlineRef = databaseRef(
      database,
      `status/${user.uid}/lastOnline`
    );


    /* -----------------------------------------------------
       Listen for Firebase RTDB connection state
       ----------------------------------------------------- */

    if (presenceConnectedUnsubscribe) {
      try {
        presenceConnectedUnsubscribe();
      } catch (_) {}
    }

    presenceConnectedUnsubscribe = databaseOnValue(
      connectedRef,
      async snapshot => {

        if (snapshot.val() !== true) {
          return;
        }

        if (!currentPresenceConnectionRef) {
          return;
        }

        /*
         * If the browser suddenly closes, loses internet,
         * sleeps, or disconnects, Firebase removes this
         * connection automatically.
         */
        try {

          await onDisconnect(
            currentPresenceConnectionRef
          ).remove();

          /*
           * Record the last time this member was online.
           */
          await onDisconnect(
            currentPresenceLastOnlineRef
          ).set(
            databaseServerTimestamp()
          );


          /*
           * Mark this browser/tab as ONLINE.
           */
          await databaseSet(
            currentPresenceConnectionRef,
            true
          );

          /*
           * Also update lastOnline while connected.
           */
          await databaseSet(
            currentPresenceLastOnlineRef,
            databaseServerTimestamp()
          );

        } catch (error) {

          console.warn(
            "Kmeet global presence error:",
            error
          );

        }
      },
      error => {

        console.warn(
          "Kmeet presence connection error:",
          error
        );

      }
    );

  } finally {

    presenceStarting = false;

  }
}


/* =========================================================
   AUTOMATIC AUTHENTICATION → PRESENCE
   ========================================================= */

onAuthStateChanged(
  auth,
  async user => {

    /*
     * No authenticated user.
     *
     * Remove any presence belonging to this browser.
     */
    if (!user) {

      await removeCurrentPresence();

      return;
    }


    /*
     * Anonymous visitors can browse Discover,
     * but they are NOT counted as online members.
     */
    if (user.isAnonymous) {

      await removeCurrentPresence();

      return;
    }


    /*
     * Normal registered Kmeet member.
     *
     * Start presence automatically.
     */
    await startGlobalPresence(user);

  }
);


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
  databaseRemove,
  databaseOnValue,
  onDisconnect,
  databaseServerTimestamp
};
