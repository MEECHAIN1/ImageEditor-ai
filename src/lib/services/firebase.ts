import { initializeApp, FirebaseApp } from "firebase/app";
import { getFirestore, Firestore } from "firebase/firestore";
import { getAuth, signInAnonymously, onAuthStateChanged, Auth } from "firebase/auth";


// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBhprcnCRZVHE3df9wvK9VkQdSUwiGw11E",
  authDomain: "meechainmeebot-v1-218162-261fc.firebaseapp.com",
  projectId: "meechainmeebot-v1-218162-261fc",
  storageBucket: "meechainmeebot-v1-218162-261fc.appspot.com",
  messagingSenderId: "412472571465",
  appId: "1:412472571465:web:bbdc5c179e131b111ff198",
  measurementId: "G-CZEY486FED"
};

// Use a singleton pattern for app instances
let app: FirebaseApp;
let db: Firestore;
let auth: Auth;
let authInitialized: Promise<void> | null = null;


function getFirebaseApp() {
    if (!app) {
        app = initializeApp(firebaseConfig);
    }
    return app;
}

// FIX: Export getFirebaseDb to be used by firestoreService.
export function getFirebaseDb(): Firestore {
    if (!db) {
        db = getFirestore(getFirebaseApp());
    }
    return db;
}

function getFirebaseAuth(): Auth {
    if (!auth) {
        auth = getAuth(getFirebaseApp());
    }
    return auth;
}

// FIX: Export ensureAuthInitialized to handle anonymous user sign-in for Firestore.
export function ensureAuthInitialized(): Promise<void> {
    if (!authInitialized) {
        const authInstance = getFirebaseAuth();
        // If there's already a user, the promise is already resolved.
        if (authInstance.currentUser) {
            return Promise.resolve();
        }
        
        authInitialized = new Promise((resolve, reject) => {
            const unsubscribe = onAuthStateChanged(authInstance, user => {
                unsubscribe(); // Unsubscribe to prevent memory leaks and multiple calls
                if (user) {
                    resolve();
                } else {
                    // No user, attempt anonymous sign-in
                    signInAnonymously(authInstance)
                        .then(() => resolve())
                        .catch(reject);
                }
            }, error => {
                unsubscribe(); // Also unsubscribe on error
                reject(error);
            });
        });
    }
    return authInitialized;
}


// Initialize the app on module load, so it's ready if other Firebase services are added in the future.
getFirebaseApp();
