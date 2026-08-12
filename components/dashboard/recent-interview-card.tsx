"use client";

import { motion } from "framer-motion";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type RecentInterview = {
  company: string;
  role: string;
  date: string;
  score: number;
  status: string;
};

type RecentInterviewCardProps = {
  interviews: RecentInterview[];
};

export function RecentInterviewCard({ interviews }: RecentInterviewCardProps) {
  return (
    <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <Card className="hover-card h-full border-border/70 bg-card/80 p-1 shadow-sm">
        <CardHeader>
          <CardTitle>Recent Interviews</CardTitle>
          <CardDescription>Latest sessions and outcomes</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {interviews.length > 0 ? (
            interviews.map((item) => (
              <div key={`${item.company}-${item.role}`} className="flex items-center justify-between rounded-2xl border border-border/70 bg-background/70 px-3 py-3">
                <div>
                  <p className="text-sm font-semibold text-foreground">{item.company}</p>
                  <p className="text-sm text-muted-foreground">{item.role} • {item.date}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-foreground">{item.score}/100</p>
                  <p className="text-sm text-primary">{item.status}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-2xl border border-dashed border-border/70 bg-background/60 p-6 text-center text-sm text-muted-foreground">
              No recent interviews yet. Start a mock session to begin building momentum.
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
