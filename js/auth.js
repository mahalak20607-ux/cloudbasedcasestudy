
import { auth } from "./firebase-config.js";

import {
    onAuthStateChanged,
    signOut,
    sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";


// ==========================================
// CLOUDCASE AI AUTHENTICATION UTILITIES
// ==========================================

const AuthManager = {

    // --------------------------------------
    // Get current authenticated user
    // --------------------------------------

    getCurrentUser() {
        return auth.currentUser || null;
    },


    // --------------------------------------
    // Check whether a user is logged in
    // --------------------------------------

    isLoggedIn() {
        return !!auth.currentUser;
    },


    // --------------------------------------
    // Listen for authentication changes
    // --------------------------------------

    onChange(callback) {

        return onAuthStateChanged(
            auth,
            (user) => {

                if (typeof callback === "function") {
                    callback(user);
                }

            }
        );
    },


    // --------------------------------------
    // Require authentication
    //
    // If no user exists, redirect to login.
    // --------------------------------------

    requireAuth(
        redirectPage = "login.html"
    ) {

        return new Promise((resolve) => {

            const unsubscribe =
                onAuthStateChanged(
                    auth,
                    (user) => {

                        unsubscribe();

                        if (!user) {

                            window.location.href =
                                redirectPage;

                            resolve(null);

                            return;
                        }

                        resolve(user);
                    }
                );

        });
    },


    // --------------------------------------
    // Redirect authenticated users
    //
    // Useful for login/register pages.
    // --------------------------------------

    redirectIfAuthenticated(
        destination = "dashboard.html"
    ) {

        return new Promise((resolve) => {

            const unsubscribe =
                onAuthStateChanged(
                    auth,
                    (user) => {

                        unsubscribe();

                        if (user) {

                            window.location.href =
                                destination;

                            resolve(user);

                            return;
                        }

                        resolve(null);
                    }
                );

        });
    },


    // --------------------------------------
    // Sign out
    // --------------------------------------

    async logout(
        redirectPage = "login.html"
    ) {

        try {

            await signOut(auth);

            if (redirectPage) {

                window.location.href =
                    redirectPage;
            }

            return true;

        } catch (error) {

            console.error(
                "CloudCase AI logout error:",
                error
            );

            throw error;
        }
    },


    // --------------------------------------
    // Send password reset email
    // --------------------------------------

    async resetPassword(email) {

        if (!email) {

            throw new Error(
                "Email address is required."
            );
        }

        try {

            await sendPasswordResetEmail(
                auth,
                email.trim()
            );

            return true;

        } catch (error) {

            console.error(
                "Password reset error:",
                error
            );

            throw error;
        }
    },


    // --------------------------------------
    // Get user display name
    // --------------------------------------

    getDisplayName(user = auth.currentUser) {

        if (!user) {
            return "User";
        }


        if (
            user.displayName &&
            user.displayName.trim()
        ) {

            return user.displayName.trim();
        }


        if (user.email) {

            const username =
                user.email.split("@")[0];

            return username
                .replace(/[._-]+/g, " ")
                .replace(/\b\w/g, (letter) =>
                    letter.toUpperCase()
                );
        }


        return "User";
    },


    // --------------------------------------
    // Get user initials
    // --------------------------------------

    getInitials(user = auth.currentUser) {

        const name =
            this.getDisplayName(user);

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
    },


    // --------------------------------------
    // Get user's email
    // --------------------------------------

    getEmail(user = auth.currentUser) {

        return user?.email || "";
    },


    // --------------------------------------
    // Get user's Firebase UID
    // --------------------------------------

    getUID(user = auth.currentUser) {

        return user?.uid || null;
    },


    // --------------------------------------
    // Get account creation date
    // --------------------------------------

    getCreationDate(user = auth.currentUser) {

        if (!user) {
            return null;
        }

        return user.metadata?.creationTime || null;
    },


    // --------------------------------------
    // Check if email is verified
    // --------------------------------------

    isEmailVerified(user = auth.currentUser) {

        return !!user?.emailVerified;
    },


    // --------------------------------------
    // Get friendly Firebase error message
    // --------------------------------------

    getErrorMessage(error) {

        if (!error) {
            return "Something went wrong.";
        }


        switch (error.code) {

            case "auth/invalid-email":
                return "Please enter a valid email address.";

            case "auth/user-not-found":
                return "No account was found with this email address.";

            case "auth/wrong-password":
                return "Incorrect password. Please try again.";

            case "auth/invalid-credential":
                return "The email or password is incorrect.";

            case "auth/email-already-in-use":
                return "An account already exists with this email address.";

            case "auth/weak-password":
                return "Password is too weak. Please choose a stronger password.";

            case "auth/password-does-not-meet-requirements":
                return "Please choose a password that meets the required security rules.";

            case "auth/too-many-requests":
                return "Too many attempts. Please wait and try again later.";

            case "auth/network-request-failed":
                return "Network error. Please check your internet connection.";

            case "auth/user-disabled":
                return "This account has been disabled.";

            case "auth/operation-not-allowed":
                return "Email and password authentication is not enabled in Firebase.";

            case "auth/requires-recent-login":
                return "Please sign in again before performing this action.";

            default:
                return (
                    error.message ||
                    "Authentication failed. Please try again."
                );
        }
    },


    // --------------------------------------
    // Clear local authentication-related data
    // --------------------------------------

    clearLocalData() {

        try {

            sessionStorage.removeItem(
                "cloudcase_last_topic"
            );

            sessionStorage.removeItem(
                "cloudcase_report_style"
            );

            sessionStorage.removeItem(
                "cloudcase_generation_state"
            );

        } catch (error) {

            console.warn(
                "Could not clear local authentication data:",
                error
            );
        }
    }

};


// ==========================================
// GLOBAL EXPORT
// ==========================================

export {
    AuthManager,
    auth
};

