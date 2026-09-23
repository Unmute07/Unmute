"use client";

import { motion } from "framer-motion";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { FirestoreTimestampLike, InterviewDocument } from "@/types/interview";

type InterviewsTableProps = {
  interviews: InterviewDocument[];
};

function toJsDate(value: FirestoreTimestampLike | undefined): Date | null {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (typeof (value as { toDate?: () => Date }).toDate === "function") {
    return (value as { toDate: () => Date }).toDate();
  }
  if (typeof (value as { seconds?: number }).seconds === "number") {
    return new Date((value as { seconds: number }).seconds * 1000);
  }
  return null;
}

export function InterviewsTable({ interviews }: InterviewsTableProps) {
  return (
    <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.15 }}>
      <Card className="hover-card border-border/70 bg-card/80 p-1 shadow-sm">
        <CardHeader>
          <CardTitle>My Interviews</CardTitle>
          <CardDescription>Latest sessions and outcomes</CardDescription>
        </CardHeader>
        <CardContent>
          {interviews.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow className="border-border/70">
                  <TableHead>Company</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Score</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {interviews.map((interview) => {
                  const date = toJsDate(interview.createdAt);
                  const score = interview.feedback.overallScore;

                  return (
                    <TableRow key={interview.id} className="border-border/70">
                      <TableCell className="font-medium text-foreground">{interview.company || "—"}</TableCell>
                      <TableCell className="text-muted-foreground">{interview.role || "—"}</TableCell>
                      <TableCell>
                        <span
                          className={
                            interview.status === "completed"
                              ? "rounded-full bg-accent px-2.5 py-1 text-xs font-medium text-primary"
                              : "rounded-full bg-secondary/15 px-2.5 py-1 text-xs font-medium text-secondary"
                          }
                        >
                          {interview.status === "completed" ? "Completed" : "In progress"}
                        </span>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {date ? date.toLocaleDateString(undefined, { day: "2-digit", month: "2-digit", year: "numeric" }) : "—"}
                      </TableCell>
                      <TableCell className="text-right font-medium text-foreground">
                        {typeof score === "number" ? `${score}/100` : "—"}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
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
