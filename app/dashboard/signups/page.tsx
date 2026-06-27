/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
// import { Input } from '@/components/ui/input'
import { dashboardAPI, Signup } from "@/lib/api-services";
import { PaginationControls } from "@/components/pagination-controls";

export default function SignupsPage() {
  const [signups, setSignups] = useState<Signup[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterType, setFilterType] = useState<"company" | "team" | "">("");

  const LIMIT = 10;

  useEffect(() => {
    const fetchSignups = async () => {
      try {
        setLoading(true);
        const data = await dashboardAPI.getSignups(page, LIMIT, {
          type: filterType || undefined,
        });
        setSignups(data.data);
        setTotal(data.meta.total);
        setTotalPages(data.meta.totalPages);
        console.log("Signups loaded:", data);
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to load signups");
        console.log("Signups error:", err.response?.data);
      } finally {
        setLoading(false);
      }
    };

    fetchSignups();
  }, [page, filterType]);

  const getKycBadgeVariant = (status: string) => {
    switch (status) {
      case "APPROVED":
        return "default";
      case "PENDING":
        return "secondary";
      case "REJECTED":
        return "destructive";
      default:
        return "outline";
    }
  };

  const getBridgeBadgeVariant = (status: string) => {
    switch (status) {
      case "CONNECTED":
        return "default";
      case "PENDING":
        return "secondary";
      case "FAILED":
        return "destructive";
      default:
        return "outline";
    }
  };

  if (loading && signups.length === 0) {
    return (
      <div className="p-8">
        <div className="text-center">
          <p className="text-gray-600">Loading signups...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Signups</h1>
          <p className="mt-2 text-gray-600">Manage and track all signups</p>
        </div>

        {/* Filters */}
        <Card className="border border-gray-200 bg-white mb-6">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Filters</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setFilterType("");
                    setPage(1);
                  }}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filterType === ""
                      ? "bg-[#363636] text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => {
                    setFilterType("company");
                    setPage(1);
                  }}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filterType === "company"
                      ? "bg-[#363636] text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Companies
                </button>
                <button
                  onClick={() => {
                    setFilterType("team");
                    setPage(1);
                  }}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filterType === "team"
                      ? "bg-[#363636] text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Teams
                </button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Signups Table */}
        <Card className="border border-gray-200 bg-white overflow-hidden">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">
              Signups ({total})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {signups.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600">No signups found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left px-4 py-3 font-semibold text-gray-900">
                        Email
                      </th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-900">
                        Type
                      </th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-900">
                        Name
                      </th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-900">
                        KYC Status
                      </th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-900">
                        Bridge Status
                      </th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-900">
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {signups.map((signup) => (
                      <tr
                        key={signup.id}
                        className="border-b border-gray-100 hover:bg-gray-50"
                      >
                        <td className="px-4 py-3 text-gray-900 font-medium">
                          {signup.employeeEmail}
                        </td>
                        <td className="px-4 py-3">
                          <Badge
                            className={
                              signup.type === "company"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-purple-100 text-purple-800"
                            }
                          >
                            {signup.type}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-gray-700">
                          {signup.companyName || signup.teamName || "N/A"}
                        </td>
                        <td className="px-4 py-3">
                          <Badge
                            variant={
                              getKycBadgeVariant(signup.kycStatus) as any
                            }
                          >
                            {signup.kycStatus !== null
                              ? signup.kycStatus
                              : "N/A"}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <Badge
                            variant={
                              getBridgeBadgeVariant(
                                signup.bridgeCustomerStatus,
                              ) as any
                            }
                          >
                            {signup.bridgeCustomerStatus !== null
                              ? signup.bridgeCustomerStatus
                              : "N/A"}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-gray-600">
                          {new Date(signup.dateOfSignup).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pagination */}
        {totalPages > 1 && (
          <PaginationControls
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        )}
      </div>
    </main>
  );
}
