"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import type { User } from "firebase/auth";
import { KeyRound } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { describeAuthError, isFirebaseAuthError } from "@/services/auth.service";

type SecurityCardProps = {
  user: User;
};

export function SecurityCard({ user }: SecurityCardProps) {
  const { forgotPassword } = useAuth();
  const [sending, setSending] = useState(false);

  const hasPasswordProvider = user.providerData.some((provider) => provider.providerId === "password");

  const handleSendResetEmail = async () => {
    if (!user.email) return;

    setSending(true);
    try {
      await forgotPassword(user.email);
      toast.success("Password reset email sent");
    } catch (error) {
      console.error("[auth] forgot-password failed", isFirebaseAuthError(error) ? error.code : error);
      toast.error(describeAuthError(error));
    } finally {
      setSending(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <Card className="hover-card h-full border-border/70 bg-card/80 p-1 shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Security</CardTitle>
              <CardDescription>Manage how you sign in</CardDescription>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-accent text-primary">
              <KeyRound className="h-5 w-5" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {hasPasswordProvider ? (
            <Button variant="outline" className="rounded-full" onClick={() => void handleSendResetEmail()} disabled={sending}>
              {sending ? "Sending…" : "Send password reset email"}
            </Button>
          ) : (
            <p className="text-sm leading-6 text-muted-foreground">
              You sign in with Google — there&apos;s no password to manage.
            </p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
