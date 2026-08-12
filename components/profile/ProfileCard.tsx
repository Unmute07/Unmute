"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import type { User } from "firebase/auth";
import { toast } from "sonner";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { updateDisplayNameAndPhoto } from "@/services/user.service";
import type { UserProfileDocument } from "@/types/user";

type ProfileCardProps = {
  user: User;
  profile: UserProfileDocument | null;
};

function formatJoinDate(profile: UserProfileDocument | null): string {
  if (!profile?.joinDate) return "—";
  const date = typeof profile.joinDate.toDate === "function" ? profile.joinDate.toDate() : new Date();
  return date.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function ProfileCard({ user, profile }: ProfileCardProps) {
  const [displayName, setDisplayName] = useState(user.displayName ?? profile?.displayName ?? "");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!displayName.trim()) {
      toast.error("Name cannot be empty.");
      return;
    }

    setSaving(true);
    try {
      await updateDisplayNameAndPhoto(user, displayName.trim());
      toast.success("Profile updated");
    } catch {
      toast.error("Unable to update your profile right now.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <Card className="hover-card h-full border-border/70 bg-card/80 p-1 shadow-sm">
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Your public identity across Unmute</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4">
            <Avatar size="lg">
              <AvatarImage src={user.photoURL ?? undefined} alt={displayName} />
              <AvatarFallback>{getInitials(displayName || "U")}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-semibold text-foreground">{user.email}</p>
              <p className="text-sm text-muted-foreground">Joined {formatJoinDate(profile)}</p>
            </div>
          </div>

          <label className="space-y-2 block">
            <span className="text-sm font-medium text-foreground">Display name</span>
            <Input
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
              placeholder="Your name"
              aria-label="Display name"
            />
          </label>

          <Button className="primary-button rounded-full px-5" onClick={() => void handleSave()} disabled={saving}>
            {saving ? "Saving…" : "Save changes"}
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}
