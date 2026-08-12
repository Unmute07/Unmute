import type { Timestamp } from "firebase/firestore";

export type PreferredInterviewType = "Technical" | "Behavioral" | "HR" | "Mixed";
export type PreferredDifficulty = "Easy" | "Medium" | "Hard";

export type UserProfileDocument = {
  uid: string;
  email: string | null;
  displayName: string;
  photoURL: string | null;
  joinDate: Timestamp;
  preferredInterviewType: PreferredInterviewType;
  preferredDifficulty: PreferredDifficulty;
  updatedAt: Timestamp;
};
