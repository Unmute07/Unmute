import { FirebaseError } from "firebase/app";
import {
  createUserWithEmailAndPassword,
  deleteUser,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  updateProfile,
  type User,
} from "firebase/auth";
import { collection, deleteDoc, doc, getDocs } from "firebase/firestore";

import { auth, db, googleProvider } from "@/lib/firebase";

type AuthUser = User;

const AUTH_ERROR_MESSAGES: Record<string, string> = {
  "auth/invalid-credential": "That email or password is incorrect. Please try again.",
  "auth/wrong-password": "That email or password is incorrect. Please try again.",
  "auth/user-not-found": "That email or password is incorrect. Please try again.",
  "auth/invalid-email": "Enter a valid email address.",
  "auth/too-many-requests": "Too many attempts. Please wait a moment and try again.",
  "auth/user-disabled": "This account has been disabled. Contact support for help.",
  "auth/popup-closed-by-user": "The Google sign-in window was closed before finishing.",
  "auth/cancelled-popup-request": "The Google sign-in window was closed before finishing.",
  "auth/network-request-failed": "Network error. Check your connection and try again.",
  "auth/email-already-in-use": "An account with this email already exists.",
  "auth/weak-password": "Choose a stronger password (at least 8 characters).",
  "auth/missing-android-pkg-name": "Password reset is misconfigured (missing Android package name).",
  "auth/missing-continue-uri": "Password reset is misconfigured (missing continue URL).",
  "auth/missing-ios-bundle-id": "Password reset is misconfigured (missing iOS bundle ID).",
  "auth/invalid-continue-uri": "Password reset is misconfigured (invalid continue URL domain).",
  "auth/unauthorized-continue-uri": "Password reset is misconfigured (unauthorized redirect domain).",
  "auth/quota-exceeded": "Too many password reset emails have been requested. Try again later.",
};

export function isFirebaseAuthError(error: unknown): error is FirebaseError {
  return error instanceof FirebaseError;
}

// Firebase Auth's own IndexedDB persistence layer (IndexedDBLocalPersistence._openDb)
// throws this exact plain Error — not a FirebaseError, no .code — when the tab's
// visibility flips to hidden while it is (re)opening its persistence DB. A popup-based
// sign-in triggers this by design (focusing the popup backgrounds the opener tab).
const INDEXEDDB_HIDDEN_TAB_ERROR = "Database is closing/hidden";

export function describeAuthError(error: unknown): string {
  if (isFirebaseAuthError(error)) {
    return AUTH_ERROR_MESSAGES[error.code] ?? "Unable to sign in right now. Please try again.";
  }

  if (error instanceof Error && error.message === INDEXEDDB_HIDDEN_TAB_ERROR) {
    return "Sign-in is taking a moment to sync. Please try again.";
  }

  return error instanceof Error ? error.message : "Unable to sign in right now. Please try again.";
}

export async function signUpWithEmailAndPassword(email: string, password: string, displayName: string) {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    if (result.user) {
      await updateProfile(result.user, { displayName });
    }

    return result.user as AuthUser;
  } catch (error) {
    console.error("[auth] sign-up failed", isFirebaseAuthError(error) ? error.code : error);
    throw error;
  }
}

export async function signInWithEmailAndPasswordEmail(email: string, password: string) {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return result.user as AuthUser;
  } catch (error) {
    console.error("[auth] email/password sign-in failed", isFirebaseAuthError(error) ? error.code : error);
    throw error;
  }
}

export async function signInWithGoogle() {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user as AuthUser;
  } catch (error) {
    const isHiddenTabRace = error instanceof Error && error.message === INDEXEDDB_HIDDEN_TAB_ERROR;

    console.error(
      "[auth] Google sign-in threw",
      isFirebaseAuthError(error) ? `${error.code}: ${error.message}` : error,
      isHiddenTabRace ? "(known Firebase Auth IndexedDB persistence race from the popup stealing tab focus)" : "",
    );

    // The popup sign-in itself frequently still succeeds even though this internal
    // persistence bookkeeping call rejects — auth.currentUser reflects the real state
    // synchronously, independent of whether the IndexedDB write finished. Only treat
    // this as a real failure if the user genuinely isn't signed in.
    if (isHiddenTabRace && auth.currentUser) {
      console.warn("[auth] Google sign-in actually succeeded (auth.currentUser is set) — ignoring the persistence race");
      return auth.currentUser as AuthUser;
    }

    throw error;
  }
}

export async function signOut() {
  await firebaseSignOut(auth);
}

export async function resetPassword(email: string) {
  try {
    await sendPasswordResetEmail(auth, email);
    console.log("[auth] sendPasswordResetEmail resolved without error for", email);
  } catch (error) {
    console.error(
      "[auth] password reset email failed",
      isFirebaseAuthError(error) ? `${error.code}: ${error.message}` : error,
    );
    throw error;
  }
}

export function getCurrentUser() {
  return auth.currentUser as AuthUser | null;
}

export function subscribeToAuthState(callback: (user: AuthUser | null) => void) {
  return auth.onAuthStateChanged((user) => callback(user as AuthUser | null));
}

export async function deleteAccount(user: User) {
  const interviewsSnapshot = await getDocs(collection(db, "users", user.uid, "interviews"));
  await Promise.all(interviewsSnapshot.docs.map((interviewDoc) => deleteDoc(interviewDoc.ref)));
  await deleteDoc(doc(db, "users", user.uid));
  await deleteUser(user);
}
