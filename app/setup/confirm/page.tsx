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
import { authAPI } from "@/lib/api-services";
import { useAuthStore } from "@/store/auth";

function SetupConfirmContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setTokens = useAuthStore((state) => state.setTokens);
  const setUser = useAuthStore((state) => state.setUser);

  const emailFromParams = searchParams.get("email") || "";

  const [email] = useState(emailFromParams);
  const [code, setCode] = useState("");
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

      console.log("[v0] Account created, redirecting to dashboard");
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to create account");
      console.log("[v0] Setup confirm error:", err.response?.data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <Card className="w-full max-w-md border border-gray-200">
        <CardHeader className="space-y-2">
          <CardTitle className="text-2xl font-bold text-gray-900">
            Complete Setup
          </CardTitle>
          <CardDescription className="text-gray-600">
            Enter the code from your email and create your account
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
                value={email}
                disabled
                className="border border-gray-300 bg-gray-50"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="code"
                className="text-sm font-medium text-gray-900"
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
                className="border border-gray-300 font-mono"
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
              <p className="text-xs text-gray-500">At least 8 characters</p>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="confirmPassword"
                className="text-sm font-medium text-gray-900"
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
              disabled={
                loading ||
                !email ||
                !code ||
                !password ||
                !firstName ||
                !lastName
              }
              className="w-full bg-[#363636] text-white hover:bg-gray-700"
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
        <div className="min-h-screen bg-white flex items-center justify-center">
          <p className="text-gray-600">Loading...</p>
        </div>
      }
    >
      <SetupConfirmContent />
    </Suspense>
  );
}
