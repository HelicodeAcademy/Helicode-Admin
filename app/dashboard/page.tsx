/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { dashboardAPI, StatsResponse } from "@/lib/api-services";

export default function DashboardPage() {
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const data = await dashboardAPI.getStats();
        setStats(data);
        console.log("Stats loaded:", data);
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to load stats");
        console.log("Stats error:", err.response?.data);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-center">
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800">{error}</p>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: "Total Signups",
      value: stats?.totalSignups.toLocaleString() || "0",
      description: "All registered users",
      // icon: "👥",
    },
    {
      title: "Active Businesses",
      value: stats?.activeBusinesses.toLocaleString() || "0",
      description: "Currently active",
      // icon: "🏢",
    },
    {
      title: "Active Teams",
      value: stats?.activeTeams.toLocaleString() || "0",
      description: "Teams managing",
      // icon: "👔",
    },
    {
      title: "Total Volume",
      value: `$${(stats?.volume.total || 0).toLocaleString("en-US", { maximumFractionDigits: 2 })}`,
      description: "All transactions",
      // icon: "💰",
    },
  ];

  return (
    <main className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-2 text-gray-600">Welcome to your admin dashboard</p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          {statCards.map((stat, index) => (
            <Card key={index} className="border border-gray-200 bg-white">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-sm font-medium text-gray-700">
                    {stat.title}
                  </CardTitle>
                  {/* <span className="text-2xl">{stat.icon}</span> */}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-3xl font-bold text-gray-900">
                    {stat.value}
                  </p>
                  <p className="text-xs text-gray-500">{stat.description}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Volume Breakdown */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* By Currency */}
          <Card className="border border-gray-200 bg-white">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900">
                Volume by Currency
              </CardTitle>
              <CardDescription className="text-gray-600">
                Breakdown of transaction volumes
              </CardDescription>
            </CardHeader>
            <CardContent>
              {stats?.volume.byCurrency &&
              Object.keys(stats.volume.byCurrency).length > 0 ? (
                <div className="space-y-3">
                  {Object.entries(stats.volume.byCurrency).map(
                    ([currency, amount]) => (
                      <div
                        key={currency}
                        className="flex items-center justify-between"
                      >
                        <span className="text-sm font-medium text-gray-700">
                          {currency}
                        </span>
                        <span className="text-sm font-bold text-gray-900">
                          $
                          {(amount as number).toLocaleString("en-US", {
                            maximumFractionDigits: 2,
                          })}
                        </span>
                      </div>
                    ),
                  )}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No data available</p>
              )}
            </CardContent>
          </Card>

          {/* By Wallet Type */}
          <Card className="border border-gray-200 bg-white">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900">
                Volume by Wallet Type
              </CardTitle>
              <CardDescription className="text-gray-600">
                Breakdown by wallet category
              </CardDescription>
            </CardHeader>
            <CardContent>
              {stats?.volume.byWalletType &&
              Object.keys(stats.volume.byWalletType).length > 0 ? (
                <div className="space-y-3">
                  {Object.entries(stats.volume.byWalletType).map(
                    ([walletType, amount]) => (
                      <div
                        key={walletType}
                        className="flex items-center justify-between"
                      >
                        <span className="text-sm font-medium text-gray-700">
                          {walletType}
                        </span>
                        <span className="text-sm font-bold text-gray-900">
                          $
                          {(amount as number).toLocaleString("en-US", {
                            maximumFractionDigits: 2,
                          })}
                        </span>
                      </div>
                    ),
                  )}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No data available</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 rounded-lg border border-gray-200 bg-gray-50 p-6">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            Quick Actions
          </h2>
          <div className="flex flex-wrap gap-3">
            <Button className="bg-[#363636] text-white hover:bg-gray-700">
              View Signups
            </Button>
            <Button className="bg-[#363636] text-white hover:bg-gray-700">
              Manage Teams
            </Button>
            <Button className="bg-[#0052FF] text-white hover:bg-blue-700">
              View Admins
            </Button>
            <Button
              variant="outline"
              className="border border-gray-300 text-gray-700 hover:bg-gray-100"
            >
              Export Report
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}
