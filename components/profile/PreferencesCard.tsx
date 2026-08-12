"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { updateUserProfile } from "@/services/user.service";
import type { PreferredDifficulty, PreferredInterviewType, UserProfileDocument } from "@/types/user";

type PreferencesCardProps = {
  uid: string;
  profile: UserProfileDocument | null;
};

const INTERVIEW_TYPES: PreferredInterviewType[] = ["Technical", "Behavioral", "HR", "Mixed"];
const DIFFICULTIES: PreferredDifficulty[] = ["Easy", "Medium", "Hard"];

export function PreferencesCard({ uid, profile }: PreferencesCardProps) {
  const [interviewType, setInterviewType] = useState<PreferredInterviewType>(
    profile?.preferredInterviewType ?? "Mixed",
  );
  const [difficulty, setDifficulty] = useState<PreferredDifficulty>(profile?.preferredDifficulty ?? "Medium");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateUserProfile(uid, { preferredInterviewType: interviewType, preferredDifficulty: difficulty });
      toast.success("Preferences saved");
    } catch {
      toast.error("Unable to save preferences right now.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <Card className="hover-card h-full border-border/70 bg-card/80 p-1 shadow-sm">
        <CardHeader>
          <CardTitle>Interview Preferences</CardTitle>
          <CardDescription>Defaults used when you create a new interview</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <label className="block space-y-2">
            <span className="text-sm font-medium text-foreground">Preferred interview type</span>
            <Select value={interviewType} onValueChange={(value) => setInterviewType(value as PreferredInterviewType)}>
              <SelectTrigger className="w-full" aria-label="Preferred interview type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {INTERVIEW_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-medium text-foreground">Preferred difficulty</span>
            <Select value={difficulty} onValueChange={(value) => setDifficulty(value as PreferredDifficulty)}>
              <SelectTrigger className="w-full" aria-label="Preferred difficulty">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DIFFICULTIES.map((level) => (
                  <SelectItem key={level} value={level}>
                    {level}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </label>

          <Button className="primary-button rounded-full px-5" onClick={() => void handleSave()} disabled={saving}>
            {saving ? "Saving…" : "Save preferences"}
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}
