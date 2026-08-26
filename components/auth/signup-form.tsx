"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { describeAuthError, isFirebaseAuthError } from "@/services/auth.service";

const signupSchema = z
  .object({
    fullName: z.string().min(2, "Please enter your full name"),
    email: z.string().email("Enter a valid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(8, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type SignupFormValues = z.infer<typeof signupSchema>;

type SignupFormProps = {
  onSuccess?: () => void;
};

export function SignupForm({ onSuccess }: SignupFormProps) {
  const { signup, loading } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    mode: "onBlur",
  });

  const onSubmit = async (values: SignupFormValues) => {
    try {
      await signup(values.email, values.password, values.fullName);
      toast.success("Account created successfully.");
      onSuccess?.();
    } catch (error) {
      console.error("[auth] sign-up failed", isFirebaseAuthError(error) ? error.code : error);
      toast.error(describeAuthError(error));
    }
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
      <div>
        <label htmlFor="fullName" className="mb-2 block text-sm font-medium text-foreground">
          Full Name
        </label>
        <Input id="fullName" type="text" placeholder="Alex Morgan" {...register("fullName")} />
        {errors.fullName ? <p className="mt-2 text-sm text-destructive">{errors.fullName.message}</p> : null}
      </div>

      <div>
        <label htmlFor="email" className="mb-2 block text-sm font-medium text-foreground">
          Email
        </label>
        <Input id="email" type="email" placeholder="you@example.com" {...register("email")} />
        {errors.email ? <p className="mt-2 text-sm text-destructive">{errors.email.message}</p> : null}
      </div>

      <div>
        <label htmlFor="password" className="mb-2 block text-sm font-medium text-foreground">
          Password
        </label>
        <Input id="password" type="password" placeholder="Create a strong password" {...register("password")} />
        {errors.password ? <p className="mt-2 text-sm text-destructive">{errors.password.message}</p> : null}
      </div>

      <div>
        <label htmlFor="confirmPassword" className="mb-2 block text-sm font-medium text-foreground">
          Confirm Password
        </label>
        <Input id="confirmPassword" type="password" placeholder="Repeat your password" {...register("confirmPassword")} />
        {errors.confirmPassword ? <p className="mt-2 text-sm text-destructive">{errors.confirmPassword.message}</p> : null}
      </div>

      <Button type="submit" className="primary-button h-12 w-full rounded-full" disabled={isSubmitting || loading}>
        {isSubmitting || loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
        Create Account
      </Button>
    </form>
  );
}
