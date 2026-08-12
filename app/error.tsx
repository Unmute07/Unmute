"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="max-w-md border-border/70 bg-card/80 text-center shadow-[0_18px_55px_rgba(15,23,42,0.08)]">
        <CardHeader className="items-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <CardTitle className="mt-2">Something went wrong</CardTitle>
          <CardDescription>An unexpected error interrupted this page. You can try again.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button className="primary-button rounded-full px-5" onClick={() => reset()}>
            Try again
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
