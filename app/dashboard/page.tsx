"use client";

import { useMemo } from "react";

import { Header } from "@/components/dashboard/header";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { Sidebar } from "@/components/dashboard/sidebar";
import { WelcomeCard } from "@/components/dashboard/welcome-card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";

function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <Skeleton className="h-40 rounded-2xl" />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <Skeleton key={index} className="h-24 rounded-2xl" />
        ))}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { user, userVersion, loading } = useAuth();

  const displayName = useMemo(() => {
    if (!user?.displayName) return "there";
    return user.displayName.split(" ")[0];
    // userVersion isn't read directly, but Firebase mutates `user` in place on
    // profile updates, so it's the only thing that changes when displayName does.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, userVersion]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="flex min-h-screen flex-col lg:flex-row">
        <Sidebar />
        <div className="flex flex-1 flex-col">
          <Header title="Dashboard" subtitle="Your interview prep command center" />
          <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-8 px-4 py-6 sm:px-6 lg:px-8">
            {loading ? (
              <DashboardSkeleton />
            ) : (
              <>
                <WelcomeCard name={displayName} />
                <QuickActions />
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
