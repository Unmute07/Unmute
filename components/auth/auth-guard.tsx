"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

import { VerifyEmailGate } from "@/components/auth/verify-email-gate";
import { useAuth } from "@/hooks/useAuth";

type AuthGuardProps = {
  children: React.ReactNode;
};

export function AuthGuard({ children }: AuthGuardProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const isAuthRoute = pathname === "/login" || pathname === "/signup";
  const isPublicRoute = pathname === "/" || isAuthRoute;
  const needsVerification = Boolean(user) && !user?.emailVerified && !isPublicRoute;

  useEffect(() => {
    if (loading) {
      return;
    }

    if (!user && !isPublicRoute) {
      router.replace("/login");
    }

    if (user && isAuthRoute) {
      router.replace("/dashboard");
    }
  }, [loading, pathname, router, user, isAuthRoute, isPublicRoute]);

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center bg-background" />;
  }

  if (needsVerification) {
    return <VerifyEmailGate />;
  }

  return <>{children}</>;
}
