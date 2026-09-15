
import { auth, db } from "./firebase-config.js";

import {
    onAuthStateChanged,
    sendPasswordResetEmail,
    signOut
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

import {
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";


// ==========================================
// DOM ELEMENTS
// ==========================================

const profileLoading = document.getElementById("profileLoading");
const profileContent = document.getElementById("profileContent");

const profileAvatar = document.getElementById("profileAvatar");

const profileDisplayName =
    document.getElementById("profileDisplayName");

const profileDisplayEmail =
    document.getElementById("profileDisplayEmail");

const summaryEmail =
    document.getElementById("summaryEmail");

const accountCreated =
    document.getElementById("accountCreated");

const profileName =
    document.getElementById("profileName");

const profileEmail =
    document.getElementById("profileEmail");

const resetPasswordBtn =
    document.getElementById("resetPasswordBtn");

const historyBtn =
    document.getElementById("historyBtn");

const logoutBtn =
    document.getElementById("logoutBtn");

const profileToast =
    document.getElementById("profileToast");


// ==========================================
// CURRENT USER
// ==========================================

let currentUser = null;


// ==========================================
// AUTHENTICATION GUARD
// ==========================================

onAuthStateChanged(auth, async (user) => {

    if (!user) {
        window.location.href = "login.html";
        return;
    }

    currentUser = user;

    await loadProfile(user);
});


// ==========================================
// LOAD PROFILE
// ==========================================

async function loadProfile(user) {

    try {

        let displayName =
            user.displayName ||
            "";

        let email =
            user.email ||
            "";

        let createdAt =
            user.metadata?.creationTime ||
            null;


        // --------------------------------------
        // Try loading additional user information
        // from Firestore
        // --------------------------------------

        try {

            const userRef =
                doc(db, "users", user.uid);

            const userSnapshot =
                await getDoc(userRef);

            if (userSnapshot.exists()) {

                const firestoreData =
                    userSnapshot.data();

                if (
                    firestoreData.name &&
                    firestoreData.name.trim()
                ) {
                    displayName =
                        firestoreData.name.trim();
                }

                if (
                    firestoreData.email &&
                    firestoreData.email.trim()
                ) {
                    email =
                        firestoreData.email.trim();
                }

                if (
                    firestoreData.createdAt
                ) {
                    createdAt =
                        firestoreData.createdAt;
                }
            }

        } catch (firestoreError) {

            /*
             * The profile page can still work if the
             * users collection is unavailable.
             */
            console.warn(
                "Could not load additional Firestore profile data:",
                firestoreError
            );
        }


        // --------------------------------------
        // Fallback name
        // --------------------------------------

        if (!displayName) {

            displayName =
                getNameFromEmail(email);

        }


        // --------------------------------------
        // Update UI
        // --------------------------------------

        setText(
            profileDisplayName,
            displayName
        );

        setText(
            profileDisplayEmail,
            email
        );

        setText(
            summaryEmail,
            email
        );


        if (profileName) {
            profileName.value = displayName;
        }

        if (profileEmail) {
            profileEmail.value = email;
        }


        // --------------------------------------
        // Avatar
        // --------------------------------------

        if (profileAvatar) {

            profileAvatar.textContent =
                getInitials(displayName);

        }


        // --------------------------------------
        // Account creation date
        // --------------------------------------

        if (accountCreated) {

            accountCreated.textContent =
                formatDate(createdAt);

        }


        // --------------------------------------
        // Show page
        // --------------------------------------

        if (profileLoading) {
            profileLoading.style.display = "none";
        }

        if (profileContent) {
            profileContent.style.display = "grid";
        }

    } catch (error) {

        console.error(
            "Profile loading error:",
            error
        );

        if (profileLoading) {

            profileLoading.innerHTML = `
                <div style="
                    color:#b91c1c;
                    font-size:14px;
                    font-weight:600;
                ">
                    Unable to load your profile.
                </div>

                <button
                    type="button"
                    id="profileRetryBtn"
                    style="
                        margin-top:15px;
                        border:1px solid #dbe2ea;
                        background:#ffffff;
                        color:#334155;
                        border-radius:8px;
                        padding:9px 15px;
                        cursor:pointer;
                        font-weight:600;
                    "
                >
                    Try Again
                </button>
            `;

            document
                .getElementById("profileRetryBtn")
                ?.addEventListener(
                    "click",
                    () => window.location.reload()
                );
        }
    }
}


// ==========================================
// PASSWORD RESET
// ==========================================

resetPasswordBtn?.addEventListener(
    "click",
    async () => {

        if (!currentUser?.email) {

            showToast(
                "No email address is available for password reset.",
                "error"
            );

            return;
        }


        const originalText =
            resetPasswordBtn.innerHTML;

        try {

            resetPasswordBtn.disabled = true;

            resetPasswordBtn.innerHTML = `
                <span
                    class="spinner-border spinner-border-sm me-1"
                    aria-hidden="true"
                ></span>
                Sending...
            `;


            await sendPasswordResetEmail(
                auth,
                currentUser.email
            );


            showToast(
                `Password reset link sent to ${currentUser.email}.`,
                "success"
            );


        } catch (error) {

            console.error(
                "Password reset error:",
                error
            );


            let message =
                "Unable to send the password reset email.";

            switch (error.code) {

                case "auth/invalid-email":
                    message =
                        "The email address is invalid.";
                    break;

                case "auth/user-not-found":
                    message =
                        "No account was found with this email address.";
                    break;

                case "auth/too-many-requests":
                    message =
                        "Too many requests. Please try again later.";
                    break;

                case "auth/network-request-failed":
                    message =
                        "Network error. Please check your internet connection.";
                    break;

                default:
                    break;
            }


            showToast(
                message,
                "error"
            );

        } finally {

            resetPasswordBtn.disabled = false;

            resetPasswordBtn.innerHTML =
                originalText;
        }
    }
);


// ==========================================
// HISTORY BUTTON
// ==========================================

historyBtn?.addEventListener(
    "click",
    () => {
        window.location.href =
            "history.html";
    }
);


// ==========================================
// LOGOUT
// ==========================================

logoutBtn?.addEventListener(
    "click",
    async () => {

        const confirmed =
            window.confirm(
                "Are you sure you want to sign out of CloudCase AI?"
            );

        if (!confirmed) {
            return;
        }


        const originalText =
            logoutBtn.innerHTML;


        try {

            logoutBtn.disabled = true;

            logoutBtn.innerHTML = `
                <span
                    class="spinner-border spinner-border-sm me-1"
                    aria-hidden="true"
                ></span>
                Signing Out...
            `;


            await signOut(auth);

            window.location.href =
                "login.html";


        } catch (error) {

            console.error(
                "Logout error:",
                error
            );

            logoutBtn.disabled = false;

            logoutBtn.innerHTML =
                originalText;

            showToast(
                "Unable to sign out. Please try again.",
                "error"
            );
        }
    }
);


// ==========================================
// TEXT HELPER
// ==========================================

function setText(element, value) {

    if (!element) {
        return;
    }

    element.textContent =
        value || "—";
}


// ==========================================
// GET NAME FROM EMAIL
// ==========================================

function getNameFromEmail(email) {

    if (!email) {
        return "User";
    }

    const username =
        email.split("@")[0];

    if (!username) {
        return "User";
    }

    return username
        .replace(/[._-]+/g, " ")
        .replace(/\b\w/g, (letter) =>
            letter.toUpperCase()
        );
}


// ==========================================
// GET INITIALS
// ==========================================

function getInitials(name) {

    if (!name) {
        return "U";
    }

    const words =
        name
            .trim()
            .split(/\s+/)
            .filter(Boolean);

    if (words.length === 1) {

        return words[0]
            .substring(0, 2)
            .toUpperCase();
    }

    return (
        words[0].charAt(0) +
        words[words.length - 1].charAt(0)
    ).toUpperCase();
}


// ==========================================
// DATE FORMATTER
// ==========================================

function formatDate(value) {

    if (!value) {
        return "Not available";
    }

    let date = null;


    // Firebase Timestamp
    if (
        typeof value.toDate === "function"
    ) {
        date = value.toDate();
    }


    // JavaScript Date
    else if (value instanceof Date) {
        date = value;
    }


    // Timestamp object
    else if (
        typeof value === "object" &&
        typeof value.seconds === "number"
    ) {

        date =
            new Date(
                value.seconds * 1000
            );
    }


    // String date
    else if (
        typeof value === "string"
    ) {

        date =
            new Date(value);
    }


    // Number timestamp
    else if (
        typeof value === "number"
    ) {

        date =
            new Date(value);
    }


    if (
        !date ||
        Number.isNaN(date.getTime())
    ) {
        return "Not available";
    }


    return date.toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );
}


// ==========================================
// TOAST
// ==========================================

function showToast(
    message,
    type = "success"
) {

    if (!profileToast) {
        return;
    }


    profileToast.textContent =
        message;


    profileToast.className =
        `profile-toast ${type} show`;


    clearTimeout(
        showToast.timer
    );


    showToast.timer =
        setTimeout(() => {

            profileToast.classList.remove(
                "show"
            );

        }, 4000);
}

