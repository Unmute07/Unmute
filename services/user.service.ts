import { doc, getDoc, onSnapshot, setDoc, Timestamp, type FirestoreError, type Unsubscribe } from "firebase/firestore";
import { updateProfile, type User } from "firebase/auth";

import { db } from "@/lib/firebase";
import type { UserProfileDocument } from "@/types/user";

function defaultProfile(user: User): UserProfileDocument {
  return {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName ?? "Unmute member",
    photoURL: user.photoURL,
    joinDate: Timestamp.fromDate(new Date()),
    preferredInterviewType: "Mixed",
    preferredDifficulty: "Medium",
    updatedAt: Timestamp.fromDate(new Date()),
  };
}

export async function getOrCreateUserProfile(user: User): Promise<UserProfileDocument> {
  try {
    const ref = doc(db, "users", user.uid);
    const snapshot = await getDoc(ref);

    if (snapshot.exists()) {
      return snapshot.data() as UserProfileDocument;
    }

    const profile = defaultProfile(user);
    await setDoc(ref, profile);
    return profile;
  } catch (error) {
    console.error("[firestore] getOrCreateUserProfile failed", (error as FirestoreError)?.code ?? error);
    throw error;
  }
}

export function subscribeToUserProfile(
  uid: string,
  onData: (profile: UserProfileDocument | null) => void,
  onError?: (error: FirestoreError) => void,
): Unsubscribe {
  const ref = doc(db, "users", uid);
  return onSnapshot(
    ref,
    (snapshot) => {
      onData(snapshot.exists() ? (snapshot.data() as UserProfileDocument) : null);
    },
    (error) => {
      console.error("[firestore] subscribeToUserProfile failed", error.code, error.message);
      onError?.(error);
    },
  );
}

export async function updateUserProfile(
  uid: string,
  partial: Partial<Omit<UserProfileDocument, "uid" | "joinDate">>,
): Promise<void> {
  const ref = doc(db, "users", uid);
  await setDoc(ref, { ...partial, updatedAt: Timestamp.fromDate(new Date()) }, { merge: true });
}

export async function updateDisplayNameAndPhoto(user: User, displayName: string): Promise<void> {
  await updateProfile(user, { displayName });
  await updateUserProfile(user.uid, { displayName });
}
