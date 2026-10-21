/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme-toggle";
import { authAPI } from "@/lib/api-services";

export default function SetupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await authAPI.setupCode(email);
      setSuccess(true);
      console.log("[v0] Setup code sent, code:", result.code);
      // Redirect to confirm page with email param
      setTimeout(() => {
        router.push(`/setup/confirm?email=${encodeURIComponent(email)}`);
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to send setup code");
      console.log("[v0] Setup code error:", err.response?.data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-canvas p-4">
      <ThemeToggle className="absolute right-4 top-4" />
      <Card className="w-full max-w-md border border-line bg-surface">
        <CardHeader className="space-y-2">
          <CardTitle className="text-2xl font-bold text-ink">
            Admin Setup
          </CardTitle>
          <CardDescription className="text-ink-muted">
            Enter your email to receive a setup code
          </CardDescription>
        </CardHeader>
        <CardContent>
          {success ? (
            <div className="space-y-4">
              <div className="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-emerald-500/25 dark:bg-emerald-500/10">
                <p className="text-sm font-medium text-green-800 dark:text-emerald-400">
                  Setup code sent to {email}
                </p>
                <p className="mt-2 text-xs text-green-700 dark:text-emerald-400/80">
                  Redirecting to confirmation page...
                </p>
              </div>
            </div>
          ) : (
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

              {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-500/25 dark:bg-red-500/10">
                  <p className="text-sm text-red-800 dark:text-red-400">{error}</p>
                </div>
              )}

              <Button
                type="submit"
                disabled={loading || !email}
                className="w-full bg-ink text-canvas hover:bg-ink/90"
              >
                {loading ? "Sending..." : "Send Setup Code"}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
