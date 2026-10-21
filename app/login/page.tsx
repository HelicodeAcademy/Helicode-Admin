/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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

export default function LoginPage() {
  const router = useRouter();
  const setTokens = useAuthStore((state) => state.setTokens);
  const setUser = useAuthStore((state) => state.setUser);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await authAPI.login({
        email,
        password,
      });

      // Store tokens and user
      setTokens(result.accessToken, result.refreshToken);
      setUser(result.user);

      // Initialize API client with token
      const { initializeApiClient } = await import("@/lib/api-client");
      initializeApiClient();

      console.log("Login successful, redirecting to dashboard");
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.message || "Invalid email or password");
      console.log("Login error:", err.response?.data);
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
            Admin Login
          </CardTitle>
          <CardDescription className="text-ink-muted">
            Sign in to your admin account
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
                placeholder="admin@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="border border-line-strong bg-surface text-ink dark:bg-surface"
              />
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
            </div>

            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-500/25 dark:bg-red-500/10">
                <p className="text-sm text-red-800 dark:text-red-400">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              disabled={loading || !email || !password}
              className="w-full bg-ink text-canvas hover:bg-ink/90"
            >
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <div className="mt-6 border-t border-line pt-6">
            <p className="text-center text-sm text-ink-muted">
              Don&apos;t have an account?{" "}
              <Link
                href="/setup"
                className="font-medium text-brand hover:underline"
              >
                Setup here
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
