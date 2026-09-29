import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  signInAnonymously
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
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
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDgRaeK8CnCpHyxaIE7MaspmRinswwsrNo",
  authDomain: "kmeet-database.firebaseapp.com",
  projectId: "kmeet-database",
  storageBucket: "kmeet-database.firebasestorage.app",
  messagingSenderId: "123313610325",
  appId: "1:123313610325:web:255c467996eff14d72bedc"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export {
  app,
  auth,
  db,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  signInAnonymously,
  doc,
  getDoc,
  setDoc,
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp
};
  import { getMessaging, getToken, onMessage } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging.js";

export const messaging = getMessaging(app);

export async function enableKmeetNotifications() {
    try {
        const permission = await Notification.requestPermission();

        if (permission !== "granted") {
            console.log("Notification permission was not granted.");
            return null;
        }

        const token = await getToken(messaging, {
            vapidKey: "BIm2miIm8IS8i6t2-hRvItWd8EDAZjU56tsRORNP7ldzqKR5rhLKrxwgj1PrSjAUDBfVMpF2VTkEuI2OaTCtttY"
        });

        if (token) {
            console.log("Kmeet notification registration successful.");
            console.log(token);
            return token;
        }

        console.log("No notification token was generated.");
        return null;

    } catch (error) {
        console.error("Kmeet notification setup failed:", error);
        return null;
    }
}

onMessage(messaging, payload => {
    console.log("Kmeet notification received:", payload);

    if (payload.notification) {
        new Notification(
            payload.notification.title || "Kmeet",
            {
                body:
                    payload.notification.body ||
                    "A new member has joined Kmeet ❤️",
                icon: "/K-meet/kmeet-heart.png"
            }
        );
    }
});
