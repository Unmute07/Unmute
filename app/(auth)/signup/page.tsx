"use client";

import { AuthLayout } from "@/components/auth/auth-layout";
import { SignupForm } from "@/components/auth/signup-form";

export default function SignupPage() {
  return (
    <AuthLayout
      title="Create your account"
      description="Join Unmute to start practicing smarter and interviewing with more confidence."
      footerText="Already have an account?"
      footerHref="/login"
      footerLinkText="Log in"
    >
      <SignupForm />
    </AuthLayout>
  );
}
