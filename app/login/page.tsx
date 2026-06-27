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
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <Card className="w-full max-w-md border border-gray-200">
        <CardHeader className="space-y-2">
          <CardTitle className="text-2xl font-bold text-gray-900">
            Admin Login
          </CardTitle>
          <CardDescription className="text-gray-600">
            Sign in to your admin account
          </CardDescription>
        </CardHeader>
        <CardContent>
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

            <div className="space-y-2">
              <label
                htmlFor="password"
                className="text-sm font-medium text-gray-900"
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
                className="border border-gray-300"
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              disabled={loading || !email || !password}
              className="w-full bg-[#363636] text-white hover:bg-gray-700"
            >
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-600 text-center">
              Don&apos;t have an account?{" "}
              <Link
                href="/setup"
                className="text-[#0052FF] font-medium hover:underline"
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
