import Link from "next/link";
import { Compass } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="max-w-md border-border/70 bg-card/80 text-center shadow-[0_18px_55px_rgba(15,23,42,0.08)]">
        <CardHeader className="items-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent text-primary">
            <Compass className="h-6 w-6" />
          </div>
          <CardTitle className="mt-2">Page not found</CardTitle>
          <CardDescription>The page you&apos;re looking for doesn&apos;t exist or has moved.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild className="primary-button rounded-full px-5">
            <Link href="/dashboard">Back to dashboard</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
