/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
import { useAuthStore } from "@/store/auth";

function SetupConfirmContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setTokens = useAuthStore((state) => state.setTokens);
  const setUser = useAuthStore((state) => state.setUser);

  const emailFromParams = searchParams.get("email") || "";
  const codeFromParams = searchParams.get("code") || "";
  const isInvitedAdmin = !emailFromParams && codeFromParams; // Invited admin flow: has code but no email

  const [email, setEmail] = useState(emailFromParams);
  const [code, setCode] = useState(codeFromParams);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validation
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    if (code.length !== 6) {
      setError("Code must be 6 characters");
      return;
    }

    setLoading(true);

    try {
      const result = await authAPI.setupConfirm({
        email,
        code,
        password,
        firstName,
        lastName,
      });

      // Store tokens and user
      setTokens(result.accessToken, result.refreshToken);
      setUser(result.user);

      // Initialize API client with token
      const { initializeApiClient } = await import("@/lib/api-client");
      initializeApiClient();

      console.log("Account created, redirecting to dashboard");
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to create account");
      console.log("Setup confirm error:", err.response?.data);
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
            Complete Setup
          </CardTitle>
          <CardDescription className="text-ink-muted">
            {isInvitedAdmin
              ? "Enter your email, code, and create your account"
              : "Enter the code from your email and create your account"}
          </CardDescription>
        </CardHeader>
        <CardContent>
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
                placeholder={isInvitedAdmin ? "your@email.com" : ""}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={!isInvitedAdmin}
                required
                className={`border border-line-strong bg-surface text-ink dark:bg-surface ${!isInvitedAdmin ? "bg-surface-muted dark:bg-surface-muted" : ""}`}
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="code"
                className="text-sm font-medium text-ink"
              >
                Setup Code (from email)
              </label>
              <Input
                id="code"
                type="text"
                placeholder="000000"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                maxLength={6}
                required
                className="border border-line-strong bg-surface font-mono text-ink dark:bg-surface"
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

            <div className="space-y-2">
              <label
                htmlFor="password"
                className="text-sm font-medium text-ink"
              >
                Password
              </label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="border border-line-strong bg-surface text-ink dark:bg-surface"
              />
              <p className="text-xs text-ink-subtle">At least 8 characters</p>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="confirmPassword"
                className="text-sm font-medium text-ink"
              >
                Confirm Password
              </label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
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
              disabled={
                loading ||
                !email ||
                !code ||
                !password ||
                !firstName ||
                !lastName
              }
              className="w-full bg-ink text-canvas hover:bg-ink/90"
            >
              {loading ? "Creating Account..." : "Create Account"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default function SetupConfirmPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-canvas">
          <p className="text-ink-muted">Loading...</p>
        </div>
      }
    >
      <SetupConfirmContent />
    </Suspense>
  );
}
