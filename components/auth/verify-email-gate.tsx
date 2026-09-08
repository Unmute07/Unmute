"use client";

import { useState } from "react";
import { Loader2, Mail, RefreshCw } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { describeAuthError } from "@/services/auth.service";

export function VerifyEmailGate() {
  const { user, resendVerificationEmail, reloadUser, logout } = useAuth();
  const [isResending, setIsResending] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleResend = async () => {
    setIsResending(true);
    try {
      await resendVerificationEmail();
      toast.success("Verification email sent.", {
        description: "Check your inbox — and your spam/junk folder if it doesn't show up in a minute or two.",
      });
    } catch (error) {
      toast.error(describeAuthError(error));
    } finally {
      setIsResending(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await reloadUser();
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md border-border/70 bg-card/80 shadow-[0_18px_55px_rgba(15,23,42,0.08)]">
        <CardHeader className="items-center text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Mail className="h-5 w-5" />
          </div>
          <CardTitle className="mt-3 text-2xl">Verify your email address</CardTitle>
          <CardDescription className="text-base leading-7">
            We sent a verification link to {user?.email}. Check your spam/junk folder if you don&apos;t see it, then
            come back here.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <Button type="button" className="primary-button h-11 w-full rounded-full" onClick={() => void handleRefresh()} disabled={isRefreshing}>
            {isRefreshing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
            I&apos;ve verified
          </Button>
          <Button type="button" variant="outline" className="h-11 w-full rounded-full" onClick={() => void handleResend()} disabled={isResending}>
            {isResending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Resend email
          </Button>
          <Button type="button" variant="ghost" className="h-11 w-full rounded-full" onClick={() => void logout()}>
            Sign out
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
