"use client";

import { motion } from "framer-motion";
import { CalendarClock } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type UpcomingInterviewCardProps = {
  title?: string;
  date?: string;
  time?: string;
  company?: string;
};

export function UpcomingInterviewCard({
  title = "Product Designer Screening",
  date = "Tomorrow",
  time = "10:30 AM",
  company = "Northstar Labs",
}: UpcomingInterviewCardProps) {
  return (
    <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.15 }}>
      <Card className="hover-card h-full border-border/70 bg-card/80 p-1 shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Upcoming Interview</CardTitle>
              <CardDescription>{company}</CardDescription>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-accent text-primary">
              <CalendarClock className="h-5 w-5" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <h3 className="text-lg font-semibold text-foreground">{title}</h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">A focused prep session will help you arrive calm and prepared.</p>
          </div>
          <div className="rounded-2xl border border-border/70 bg-background/70 p-3 text-sm text-muted-foreground">
            <p><span className="font-medium text-foreground">When:</span> {date} at {time}</p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
