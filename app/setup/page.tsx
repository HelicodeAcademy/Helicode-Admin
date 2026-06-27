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
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <Card className="w-full max-w-md border border-gray-200">
        <CardHeader className="space-y-2">
          <CardTitle className="text-2xl font-bold text-gray-900">
            Admin Setup
          </CardTitle>
          <CardDescription className="text-gray-600">
            Enter your email to receive a setup code
          </CardDescription>
        </CardHeader>
        <CardContent>
          {success ? (
            <div className="space-y-4">
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-800 font-medium">
                  Setup code sent to {email}
                </p>
                <p className="text-xs text-green-700 mt-2">
                  Redirecting to confirmation page...
                </p>
              </div>
            </div>
          ) : (
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

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              <Button
                type="submit"
                disabled={loading || !email}
                className="w-full bg-[#363636] text-white hover:bg-gray-700"
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
