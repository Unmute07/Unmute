"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

import { useAuth } from "@/hooks/useAuth";

type AuthGuardProps = {
  children: React.ReactNode;
};

export function AuthGuard({ children }: AuthGuardProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) {
      return;
    }

    const isAuthRoute = pathname === "/login" || pathname === "/signup";
    const isPublicRoute = pathname === "/" || isAuthRoute;

    if (!user && !isPublicRoute) {
      router.replace("/login");
    }

    if (user && isAuthRoute) {
      router.replace("/dashboard");
    }
  }, [loading, pathname, router, user]);

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center bg-background" />;
  }

  return <>{children}</>;
}
