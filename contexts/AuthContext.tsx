"use client";

import { createContext, useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import type { User } from "firebase/auth";

import {
  resetPassword,
  signInWithEmailAndPasswordEmail,
  signOut,
  signUpWithEmailAndPassword,
  subscribeToAuthState,
} from "@/services/auth.service";
import { getOrCreateUserProfile, subscribeToUserProfile } from "@/services/user.service";
import type { UserProfileDocument } from "@/types/user";

type AuthContextValue = {
  user: User | null;
  userVersion: number;
  loading: boolean;
  profile: UserProfileDocument | null;
  profileLoading: boolean;
  signup: (email: string, password: string, displayName: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  refreshUser: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  // Firebase's `updateProfile` mutates the User object in place rather than
  // replacing it, so React sees the same reference and skips re-rendering.
  // Bumping this alongside setUser forces consumers keyed on it to notice.
  const [userVersion, setUserVersion] = useState(0);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfileDocument | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = subscribeToAuthState((currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user?.uid) {
      queueMicrotask(() => {
        setProfile(null);
        setProfileLoading(false);
      });
      return;
    }

    queueMicrotask(() => setProfileLoading(true));
    getOrCreateUserProfile(user).catch((error) => {
      // Non-fatal: the app can keep running on the Auth user alone. The
      // subscription below still resolves profileLoading via its own onError.
      console.error("[firestore] failed to load or create the user profile document", error);
    });

    const unsubscribe = subscribeToUserProfile(
      user.uid,
      (nextProfile) => {
        setProfile(nextProfile);
        setProfileLoading(false);
      },
      () => {
        // Firestore error (e.g. permission-denied) must not block the rest of
        // the app or leave profileLoading stuck true forever.
        setProfileLoading(false);
      },
    );

    return () => unsubscribe();
  }, [user]);

  const refreshUser = useCallback(() => {
    setUserVersion((v) => v + 1);
  }, []);

  const signup = useCallback(async (email: string, password: string, displayName: string) => {
    const currentUser = await signUpWithEmailAndPassword(email, password, displayName);
    setUser(currentUser);
    refreshUser();
    router.push("/dashboard");
  }, [router, refreshUser]);

  const login = useCallback(async (email: string, password: string) => {
    const currentUser = await signInWithEmailAndPasswordEmail(email, password);
    setUser(currentUser);
    router.push("/dashboard");
  }, [router]);

  const logout = useCallback(async () => {
    await signOut();
    setUser(null);
    router.push("/login");
  }, [router]);

  const forgotPassword = useCallback(async (email: string) => {
    await resetPassword(email);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      userVersion,
      loading,
      profile,
      profileLoading,
      signup,
      login,
      logout,
      forgotPassword,
      refreshUser,
    }),
    [loading, user, userVersion, profile, profileLoading, logout, forgotPassword, login, signup, refreshUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export { AuthContext };
