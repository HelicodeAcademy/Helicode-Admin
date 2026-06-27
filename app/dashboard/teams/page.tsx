/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { dashboardAPI, TeamMember } from "@/lib/api-services";
import { PaginationControls } from "@/components/pagination-controls";

export default function TeamsPage() {
  const [teams, setTeams] = useState<TeamMember[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const LIMIT = 10;

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        setLoading(true);
        const data = await dashboardAPI.getTeams(page, LIMIT);

        setTeams(data.data);

        console.log(data.data);
        setTotal(data.meta.total);
        setTotalPages(data.meta.totalPages);
        console.log("Teams loaded:", data);
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to load teams");
        console.log("Teams error:", err.response?.data);
      } finally {
        setLoading(false);
      }
    };

    fetchTeams();
  }, [page]);

  if (loading && teams.length === 0) {
    return (
      <div className="p-8">
        <div className="text-center">
          <p className="text-gray-600">Loading teams...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Teams</h1>
          <p className="mt-2 text-gray-600">Manage and track team members</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Teams Table */}
        <Card className="border border-gray-200 bg-white overflow-hidden">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">
              Team Members ({total})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {teams.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600">No team members found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left px-4 py-3 font-semibold text-gray-900">
                        Name
                      </th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-900">
                        Email
                      </th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-900">
                        Role
                      </th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-900">
                        Wallet Balance
                      </th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-900">
                        Transactions
                      </th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-900">
                        Companies
                      </th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-900">
                        Joined
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {teams.map((member) => (
                      <tr
                        key={member.id}
                        className="border-b border-gray-100 hover:bg-gray-50"
                      >
                        <td className="px-4 py-3 text-gray-900 font-medium">
                          {member.fullName}
                        </td>
                        <td className="px-4 py-3 text-gray-700">
                          {member.email}
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-block text-xs font-medium">
                            {member.companies.length !== 0
                              ? member.companies.map((company) => (
                                  <div key={company.companyId}>
                                    {company.role}
                                  </div>
                                ))
                              : "N/A"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-900 font-medium">
                          $
                          {member.walletBalance.toLocaleString("en-US", {
                            maximumFractionDigits: 2,
                          })}
                        </td>
                        <td className="px-4 py-3 text-gray-700">
                          {member.totalTransactions}
                        </td>
                        <td className="px-4 py-3 text-gray-700">
                          {member.companies.length !== 0
                            ? member.companies.map((company) => (
                                <div key={company.companyId}>
                                  {company.companyName}
                                </div>
                              ))
                            : "N/A"}
                        </td>
                        <td className="px-4 py-3 text-gray-600">
                          {new Date(member.signupDate).toLocaleDateString()}
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
