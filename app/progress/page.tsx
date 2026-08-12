"use client";

import { Header } from "@/components/dashboard/header";
import { Sidebar } from "@/components/dashboard/sidebar";
import { PerformanceTrend } from "@/components/progress/PerformanceTrend";
import { ProgressOverview } from "@/components/progress/ProgressOverview";
import { SkillsBreakdown } from "@/components/progress/SkillsBreakdown";
import { Skeleton } from "@/components/ui/skeleton";
import { useInterviewStats } from "@/hooks/useInterviewStats";

function ProgressSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <Skeleton key={index} className="h-32 rounded-2xl" />
        ))}
      </div>
      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Skeleton className="h-80 rounded-2xl" />
        <Skeleton className="h-80 rounded-2xl" />
      </div>
    </div>
  );
}

export default function ProgressPage() {
  const { stats, loading } = useInterviewStats();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="flex min-h-screen flex-col lg:flex-row">
        <Sidebar />
        <div className="flex flex-1 flex-col">
          <Header title="Progress" subtitle="Track your growth over time" />
          <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col justify-center gap-8 px-4 py-6 sm:px-6 lg:px-8">
            {loading ? (
              <ProgressSkeleton />
            ) : (
              <>
                <ProgressOverview stats={stats} />

                <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
                  <PerformanceTrend data={stats.scoreTrend} />
                  <SkillsBreakdown skills={stats.skillAverages} />
                </div>
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
