import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, enableIndexedDbPersistence } from "firebase/firestore";

const userFirebaseConfig = {
    apiKey: "AIzaSyAeKM8Tn1ikC1n9PcDL6_BriOa3Zk02iy0",
    authDomain: "meus-projetos-2dc3c.firebaseapp.com",
    projectId: "meus-projetos-2dc3c",
    storageBucket: "meus-projetos-2dc3c.firebasestorage.app",
    messagingSenderId: "1021041558434",
    appId: "1:1021041558434:web:fa596b36680fab1719a8fb"
};

const firebaseConfig = typeof __firebase_config !== 'undefined'
    ? JSON.parse(__firebase_config)
    : userFirebaseConfig;

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const appId = typeof __app_id !== 'undefined' ? __app_id : 'meus-projetos-default';

// Enable Offline Persistence
enableIndexedDbPersistence(db).catch((err) => {
    if (err.code == 'failed-precondition') {
        console.warn('Persistence failed: Multiple tabs open');
    } else if (err.code == 'unimplemented') {
        console.warn('Persistence failed: Browser not supported');
    }
});
