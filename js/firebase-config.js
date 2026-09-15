// =========================================================
// CASESTUDY HUB
// Firebase Configuration
// =========================================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";

import { getAuth } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

import { getFirestore } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";


// =========================================================
// FIREBASE CONFIGURATION
// =========================================================

const firebaseConfig = {
    apiKey: "AIzaSyACx3HWCKgGcsvrJ9lgcf0jlORhfmhUsAw",
    authDomain: "cloud-based-case-study-app.firebaseapp.com",
    projectId: "cloud-based-case-study-app",
    storageBucket: "cloud-based-case-study-app.firebasestorage.app",
    messagingSenderId: "456563237334",
    appId: "1:456563237334:web:ef8c1250c828ffbc6f8477",
    measurementId: "G-3G44WDQDW4"
};


// =========================================================
// INITIALIZE FIREBASE
// =========================================================

const app = initializeApp(firebaseConfig);


// =========================================================
// FIREBASE SERVICES
// =========================================================

const auth = getAuth(app);

const db = getFirestore(app);


// =========================================================
// EXPORT
// =========================================================

export {
    app,
    auth,
    db
};