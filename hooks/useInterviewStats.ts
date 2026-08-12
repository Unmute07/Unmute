"use client";

import { useEffect, useMemo, useState } from "react";

import { useAuth } from "@/hooks/useAuth";
import { computeInterviewStats, EMPTY_STATS, subscribeToInterviews, type InterviewStats } from "@/services/interview.service";
import type { InterviewDocument } from "@/types/interview";

export function useInterviewStats(): {
  interviews: InterviewDocument[];
  stats: InterviewStats;
  loading: boolean;
  error: string | null;
} {
  const { user } = useAuth();
  const [interviews, setInterviews] = useState<InterviewDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.uid) {
      queueMicrotask(() => {
        setInterviews([]);
        setLoading(false);
      });
      return;
    }

    queueMicrotask(() => setLoading(true));
    const unsubscribe = subscribeToInterviews(
      user.uid,
      (nextInterviews) => {
        setInterviews(nextInterviews);
        setLoading(false);
        setError(null);
      },
      (subscriptionError) => {
        console.error("[firestore] subscribeToInterviews failed", subscriptionError.code, subscriptionError.message);
        setError(subscriptionError.message);
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, [user?.uid]);

  const stats = useMemo(() => (interviews.length ? computeInterviewStats(interviews) : EMPTY_STATS), [interviews]);

  return { interviews, stats, loading, error };
}
