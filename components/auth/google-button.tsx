"use client";

import { Globe, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";

type GoogleButtonProps = {
  onClick: () => Promise<void> | void;
  loading?: boolean;
  label?: string;
};

export function GoogleButton({ onClick, loading = false, label = "Continue with Google" }: GoogleButtonProps) {
  return (
    <Button
      type="button"
      variant="outline"
      className="secondary-button h-12 w-full rounded-full"
      onClick={onClick}
      disabled={loading}
    >
      {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Globe className="mr-2 h-4 w-4" />}
      {label}
    </Button>
  );
}
