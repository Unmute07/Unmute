"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import type { User } from "firebase/auth";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { deleteAccount } from "@/services/auth.service";

type DangerZoneProps = {
  user: User;
};

export function DangerZone({ user }: DangerZoneProps) {
  const router = useRouter();
  const [confirmText, setConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [open, setOpen] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteAccount(user);
      toast.success("Account deleted");
      router.push("/login");
    } catch (error) {
      const code = (error as { code?: string })?.code;
      if (code === "auth/requires-recent-login") {
        toast.error("Please sign out and back in, then try again.");
      } else {
        toast.error("Unable to delete your account right now.");
      }
    } finally {
      setDeleting(false);
      setOpen(false);
      setConfirmText("");
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.05 }}>
      <Card className="h-full border-destructive/30 bg-destructive/5 p-1 shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-destructive">Danger Zone</CardTitle>
              <CardDescription>Irreversible account actions</CardDescription>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
              <Trash2 className="h-5 w-5" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button variant="destructive" className="rounded-full">
                Delete account
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete your account?</DialogTitle>
                <DialogDescription>
                  This permanently deletes your profile and every interview record. This cannot be undone. Type
                  DELETE to confirm.
                </DialogDescription>
              </DialogHeader>
              <Input
                value={confirmText}
                onChange={(event) => setConfirmText(event.target.value)}
                placeholder="DELETE"
                aria-label="Type DELETE to confirm"
              />
              <DialogFooter>
                <Button
                  variant="destructive"
                  disabled={confirmText !== "DELETE" || deleting}
                  onClick={() => void handleDelete()}
                >
                  {deleting ? "Deleting…" : "Permanently delete"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </motion.div>
  );
}
