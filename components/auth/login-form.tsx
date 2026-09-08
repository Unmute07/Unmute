"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { describeAuthError, isFirebaseAuthError } from "@/services/auth.service";

const loginSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

type LoginFormProps = {
  onSuccess?: () => void;
};

export function LoginForm({ onSuccess }: LoginFormProps) {
  const { login, forgotPassword, loading } = useAuth();
  const [isResetLoading, setIsResetLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    getValues,
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    mode: "onBlur",
  });

  const onSubmit = async (values: LoginFormValues) => {
    try {
      await login(values.email, values.password);
      toast.success("Welcome back. You are signed in.");
      onSuccess?.();
    } catch (error) {
      console.error("[auth] login failed", isFirebaseAuthError(error) ? error.code : error);
      toast.error(describeAuthError(error));
    }
  };

  const handleForgotPassword = async () => {
    const email = getValues("email").trim();
    if (!email) {
      toast.error("Enter your email first so we can send a reset link.");
      return;
    }

    try {
      setIsResetLoading(true);
      await forgotPassword(email);
      toast.success("Password reset email sent.", {
        description: "Check your inbox — and your spam/junk folder if it doesn't show up in a minute or two.",
      });
    } catch (error) {
      console.error("[auth] forgot-password failed", isFirebaseAuthError(error) ? error.code : error);
      toast.error(describeAuthError(error));
    } finally {
      setIsResetLoading(false);
    }
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
      <div>
        <label htmlFor="email" className="mb-2 block text-sm font-medium text-foreground">
          Email
        </label>
        <Input id="email" type="email" placeholder="you@example.com" {...register("email")} />
        {errors.email ? <p className="mt-2 text-sm text-destructive">{errors.email.message}</p> : null}
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <label htmlFor="password" className="text-sm font-medium text-foreground">
            Password
          </label>
          <button
            type="button"
            className="text-sm font-medium text-primary transition-colors hover:text-primary/80"
            onClick={handleForgotPassword}
          >
            {isResetLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Forgot Password"}
          </button>
        </div>
        <Input id="password" type="password" placeholder="Enter your password" {...register("password")} />
        {errors.password ? <p className="mt-2 text-sm text-destructive">{errors.password.message}</p> : null}
      </div>

      <Button type="submit" className="primary-button h-12 w-full rounded-full" disabled={isSubmitting || loading}>
        {isSubmitting || loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
        Login
      </Button>
    </form>
  );
}
