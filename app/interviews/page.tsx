"use client";

import Link from "next/link";
import { PlayCircle, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Header } from "@/components/dashboard/header";
import { Sidebar } from "@/components/dashboard/sidebar";
import { InterviewHistory } from "@/components/progress/InterviewHistory";
import { Skeleton } from "@/components/ui/skeleton";
import { useInterviewStats } from "@/hooks/useInterviewStats";

export default function InterviewsPage() {
  const { interviews, loading } = useInterviewStats();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="flex min-h-screen flex-col lg:flex-row">
        <Sidebar />
        <div className="flex-1">
          <Header title="Interviews" subtitle="Your mock interview sessions" />
          <main className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
            <Card className="border-primary/15 bg-accent/40">
              <CardContent className="flex flex-wrap items-center justify-between gap-4 p-6">
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Start a new mock interview</CardTitle>
                    <CardDescription>Add a job description and Unmute will tailor the questions to that role.</CardDescription>
                  </div>
                </div>
                <Button asChild className="primary-button rounded-full px-5">
                  <Link href="/interviews/new">
                    <PlayCircle className="mr-2 h-4 w-4" />
                    New Interview
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {loading ? (
              <Skeleton className="h-80 rounded-2xl" />
            ) : (
              <InterviewHistory interviews={interviews} />
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
