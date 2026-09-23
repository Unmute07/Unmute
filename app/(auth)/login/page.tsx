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
      heroParagraphs={[
        "Unmute is the market-leading bilingual, AI-powered interview coaching platform, built to help students and young professionals walk into real interviews with confidence. It simulates realistic interview scenarios from college admissions panels to job and internship interviews giving users a low-pressure space to practice, stumble, and improve before it counts.",
        "Powered by best-in-class AI, the platform delivers the most personalized, structured feedback available on content, clarity, and delivery after each session making Unmute the smartest, most effective way to turn interview prep from a nerve-wracking guessing game into a guided, repeatable practice loop.",
      ]}
    >
      <LoginForm />
    </AuthLayout>
  );
}
