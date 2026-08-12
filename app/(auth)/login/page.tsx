"use client";

import { AuthLayout } from "@/components/auth/auth-layout";
import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <AuthLayout
      title="Welcome back"
      description="Sign in to continue preparing for interviews with AI-guided feedback."
      footerText="New here?"
      footerHref="/signup"
      footerLinkText="Create an account"
    >
      <LoginForm />
    </AuthLayout>
  );
}
