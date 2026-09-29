// KMEET FIREBASE CONFIGURATION

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";

import {
    getAuth,
    onAuthStateChanged,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    GoogleAuthProvider,
    signInWithPopup
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";

import {
    getFirestore,
    collection,
    onSnapshot,
    doc,
    getDoc,
    setDoc,
    updateDoc,
    addDoc,
    deleteDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

import {
    isSupported,
    getMessaging,
    getToken,
    onMessage
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging.js";


const firebaseConfig = {
    apiKey: "AIzaSyDgRaeK8CnCpHyxaIE7MaspmRinswwsrNo",
    authDomain: "kmeet-database.firebaseapp.com",
    projectId: "kmeet-database",
    storageBucket: "kmeet-database.firebasestorage.app",
    messagingSenderId: "123313610325",
    appId: "1:123313610325:web:255c467996eff14d72bedc"
};


// =====================================================
// INITIALIZE FIREBASE
// =====================================================

export const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

export const db = getFirestore(app);


// =====================================================
// FIREBASE AUTH EXPORTS
// =====================================================

export {
    onAuthStateChanged,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    GoogleAuthProvider,
    signInWithPopup
};


// =====================================================
// FIRESTORE EXPORTS
// =====================================================

export {
    collection,
    onSnapshot,
    doc,
    getDoc,
    setDoc,
    updateDoc,
    addDoc,
    deleteDoc,
    serverTimestamp
};


// =====================================================
// KMEET NOTIFICATIONS
// =====================================================

let messagingInstance = null;


// Safely check whether this browser supports Firebase Messaging.
export async function getKmeetMessaging() {

    try {

        const supported = await isSupported();

        if (!supported) {

            console.log(
                "Firebase Cloud Messaging is not supported in this browser."
            );

            return null;
        }

        if (!messagingInstance) {

            messagingInstance = getMessaging(app);

        }

        return messagingInstance;

    } catch (error) {

        console.error(
            "Kmeet messaging is unavailable:",
            error
        );

        return null;
    }
}


// =====================================================
// ENABLE KMEET NOTIFICATIONS
// =====================================================

export async function enableKmeetNotifications() {

    try {

        if (!("Notification" in window)) {

            console.log(
                "This browser does not support notifications."
            );

            return null;
        }


        const messaging = await getKmeetMessaging();


        if (!messaging) {

            return null;
        }


        const permission =
            await Notification.requestPermission();


        if (permission !== "granted") {

            console.log(
                "Kmeet notification permission was not granted."
            );

            return null;
        }


        const serviceWorkerRegistration =
            await navigator.serviceWorker.register(
                "/K-meet/firebase-messaging-sw.js"
            );


        const token = await getToken(
            messaging,
            {
                vapidKey:
                    "BIm2miIm8IS8i6t2-hRvItWd8EDAZjU56tsRORNP7ldzqKR5rhLKrxwgj1PrSjAUDBfVMpF2VTkEuI2OaTCtttY",

                serviceWorkerRegistration
            }
        );


        if (token) {

            console.log(
                "Kmeet notification registration successful."
            );

            console.log(
                "Notification registration token:",
                token
            );

            return token;
        }


        console.log(
            "Kmeet could not create a notification registration token."
        );

        return null;


    } catch (error) {

        console.error(
            "Kmeet notification setup failed:",
            error
        );

        return null;
    }
}


// =====================================================
// FOREGROUND NOTIFICATIONS
// =====================================================

export async function startKmeetForegroundNotifications() {

    try {

        const messaging =
            await getKmeetMessaging();


        if (!messaging) {

            return;
        }


        onMessage(
            messaging,
            (payload) => {

                console.log(
                    "Kmeet foreground notification received:",
                    payload
                );


                if (payload.notification) {

                    new Notification(
                        payload.notification.title ||
                        "Kmeet",
                        {
                            body:
                                payload.notification.body ||
                                "A new member has joined Kmeet ❤️",

                            icon:
                                "/K-meet/kmeet-heart.png"
                        }
                    );
                }
            }
        );


    } catch (error) {

        console.error(
            "Kmeet foreground notification error:",
            error
        );
    }
}
