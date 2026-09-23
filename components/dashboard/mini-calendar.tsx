"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const WEEKDAY_LABELS = ["M", "T", "W", "T", "F", "S", "S"];

type MiniCalendarProps = {
  activityDates?: Date[];
};

function toDayKey(date: Date): string {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

function buildMonthGrid(monthAnchor: Date): Date[] {
  const year = monthAnchor.getFullYear();
  const month = monthAnchor.getMonth();
  const firstOfMonth = new Date(year, month, 1);
  // Convert Sunday-first getDay() (0-6) to Monday-first offset (0-6).
  const leadingOffset = (firstOfMonth.getDay() + 6) % 7;
  const gridStart = new Date(year, month, 1 - leadingOffset);

  return Array.from({ length: 42 }, (_, index) => {
    const day = new Date(gridStart);
    day.setDate(gridStart.getDate() + index);
    return day;
  });
}

export function MiniCalendar({ activityDates = [] }: MiniCalendarProps) {
  const [monthAnchor, setMonthAnchor] = useState(() => new Date());

  const activityKeys = useMemo(() => new Set(activityDates.map(toDayKey)), [activityDates]);
  const today = useMemo(() => new Date(), []);
  const todayKey = toDayKey(today);
  const days = useMemo(() => buildMonthGrid(monthAnchor), [monthAnchor]);
  const monthLabel = monthAnchor.toLocaleDateString(undefined, { month: "long", year: "numeric" });

  return (
    <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.1 }} className="h-full">
      <Card className="hover-card h-full border-border/70 bg-card/80 p-1 shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full"
              aria-label="Previous month"
              onClick={() => setMonthAnchor((current) => new Date(current.getFullYear(), current.getMonth() - 1, 1))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <CardTitle className="text-base">{monthLabel}</CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full"
              aria-label="Next month"
              onClick={() => setMonthAnchor((current) => new Date(current.getFullYear(), current.getMonth() + 1, 1))}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-y-2 text-center">
            {WEEKDAY_LABELS.map((label, index) => (
              <p key={`${label}-${index}`} className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {label}
              </p>
            ))}
            {days.map((day) => {
              const key = toDayKey(day);
              const inCurrentMonth = day.getMonth() === monthAnchor.getMonth();
              const isToday = key === todayKey;
              const hasActivity = activityKeys.has(key);

              return (
                <div key={key} className="flex flex-col items-center gap-1 py-1">
                  <span
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-full text-sm transition-colors",
                      isToday
                        ? "bg-primary font-semibold text-primary-foreground shadow-sm"
                        : inCurrentMonth
                          ? "text-foreground hover:bg-accent"
                          : "text-muted-foreground/40"
                    )}
                  >
                    {day.getDate()}
                  </span>
                  <span
                    className={cn(
                      "h-1 w-1 rounded-full",
                      hasActivity && !isToday ? "bg-secondary" : "bg-transparent"
                    )}
                  />
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
