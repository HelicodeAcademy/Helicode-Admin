/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { adminAPI } from "@/lib/api-services";

interface InviteAdminDialogProps {
  onSuccess: () => void;
}

export function InviteAdminDialog({ onSuccess }: InviteAdminDialogProps) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await adminAPI.inviteAdmin(email, firstName, lastName);
      console.log("Admin invited successfully");
      setEmail("");
      setFirstName("");
      setLastName("");
      setOpen(false);
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to invite admin");
      console.log("Invite error:", err.response?.data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-brand text-white hover:bg-brand/90">
          Invite Admin
        </Button>
      </DialogTrigger>
      <DialogContent className="border border-line bg-surface">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-ink">
            Invite New Admin
          </DialogTitle>
          <DialogDescription className="text-ink-muted">
            Send an invitation to a new admin user
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label
              htmlFor="email"
              className="text-sm font-medium text-ink"
            >
              Email Address
            </label>
            <Input
              id="email"
              type="email"
              placeholder="admin@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="border border-line-strong bg-surface text-ink dark:bg-surface"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label
                htmlFor="firstName"
                className="text-sm font-medium text-ink"
              >
                First Name
              </label>
              <Input
                id="firstName"
                type="text"
                placeholder="John"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                className="border border-line-strong bg-surface text-ink dark:bg-surface"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="lastName"
                className="text-sm font-medium text-ink"
              >
                Last Name
              </label>
              <Input
                id="lastName"
                type="text"
                placeholder="Doe"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                className="border border-line-strong bg-surface text-ink dark:bg-surface"
              />
            </div>
          </div>

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-500/25 dark:bg-red-500/10">
              <p className="text-sm text-red-800 dark:text-red-400">{error}</p>
            </div>
          )}

          <div className="flex gap-2 justify-end pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="border border-line-strong text-ink-secondary hover:bg-surface-muted"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || !email || !firstName || !lastName}
              className="bg-ink text-canvas hover:bg-ink/90"
            >
              {loading ? "Inviting..." : "Send Invite"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
