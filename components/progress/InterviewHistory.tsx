"use client";

import Link from "next/link";
import { motion } from "framer-motion";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { FirestoreTimestampLike, InterviewDocument } from "@/types/interview";

type InterviewHistoryProps = {
  interviews?: InterviewDocument[];
};

function formatDate(value: FirestoreTimestampLike | undefined): string {
  if (!value) return "—";
  if (value instanceof Date) return value.toLocaleDateString();
  if (typeof (value as { toDate?: () => Date }).toDate === "function") {
    return (value as { toDate: () => Date }).toDate().toLocaleDateString();
  }
  if (typeof (value as { seconds?: number }).seconds === "number") {
    return new Date((value as { seconds: number }).seconds * 1000).toLocaleDateString();
  }
  return "—";
}

export function InterviewHistory({ interviews = [] }: InterviewHistoryProps) {
  return (
    <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.2 }}>
      <Card className="hover-card h-full border-border/70 bg-card/80 p-1 shadow-sm">
        <CardHeader>
          <CardTitle>Interview History</CardTitle>
          <CardDescription>Every mock interview you have started</CardDescription>
        </CardHeader>
        <CardContent>
          {interviews.length ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Company</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {interviews.map((interview) => {
                  const isCompleted = interview.status === "completed";
                  return (
                    <TableRow key={interview.id}>
                      <TableCell className="font-medium text-foreground">{interview.company}</TableCell>
                      <TableCell className="text-muted-foreground">{interview.role}</TableCell>
                      <TableCell className="text-muted-foreground">{formatDate(interview.createdAt)}</TableCell>
                      <TableCell className="text-foreground">
                        {isCompleted ? `${interview.feedback.overallScore ?? 0}/100` : "—"}
                      </TableCell>
                      <TableCell>
                        <Badge variant={isCompleted ? "default" : "outline"}>
                          {isCompleted ? "Completed" : "In progress"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Link
                          href={isCompleted ? `/feedback/${interview.id}` : `/interview/${interview.id}`}
                          className="text-sm font-medium text-primary hover:underline"
                        >
                          {isCompleted ? "View feedback" : "Continue"}
                        </Link>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="rounded-2xl border border-dashed border-border/70 bg-background/60 p-6 text-center text-sm text-muted-foreground">
              No interviews yet — start your first mock interview.
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
