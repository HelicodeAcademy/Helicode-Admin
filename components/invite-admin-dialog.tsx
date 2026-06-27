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
        <Button className="bg-[#0052FF] text-white hover:bg-blue-700">
          Invite Admin
        </Button>
      </DialogTrigger>
      <DialogContent className="border border-gray-200">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-gray-900">
            Invite New Admin
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            Send an invitation to a new admin user
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label
              htmlFor="email"
              className="text-sm font-medium text-gray-900"
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
              className="border border-gray-300"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label
                htmlFor="firstName"
                className="text-sm font-medium text-gray-900"
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
                className="border border-gray-300"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="lastName"
                className="text-sm font-medium text-gray-900"
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
                className="border border-gray-300"
              />
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <div className="flex gap-2 justify-end pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="border border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || !email || !firstName || !lastName}
              className="bg-[#363636] text-white hover:bg-gray-700"
            >
              {loading ? "Inviting..." : "Send Invite"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
