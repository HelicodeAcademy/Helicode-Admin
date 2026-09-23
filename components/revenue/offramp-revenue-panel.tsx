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
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  dashboardAPI,
  OfframpProvider,
  OfframpRevenueStats,
  OfframpRevenueStatus,
  OfframpRevenueWithdrawal,
  OfframpSource,
} from "@/lib/api-services";
import { PaginationControls } from "@/components/pagination-controls";

const REVENUE_STATUS_OPTIONS: Array<{
  label: string;
  value: OfframpRevenueStatus | "";
}> = [
  { label: "All", value: "" },
  { label: "Collected", value: "COLLECTED" },
  { label: "Pending", value: "PENDING" },
  { label: "Failed", value: "FAILED" },
];

const SOURCE_OPTIONS: Array<{ label: string; value: OfframpSource | "" }> = [
  { label: "All sources", value: "" },
  { label: "Team Fiat", value: "TEAM_FIAT" },
  { label: "Company Fiat", value: "COMPANY_FIAT" },
  { label: "Team Crypto", value: "TEAM_CRYPTO" },
];

const PROVIDER_OPTIONS: Array<{ label: string; value: OfframpProvider | "" }> =
  [
    { label: "All providers", value: "" },
    { label: "Yellowcard", value: "YELLOWCARD" },
    { label: "Quidax", value: "QUIDAX" },
  ];

const formatAmount = (
  amount: string | number | null | undefined,
  currency?: string,
) => {
  if (amount === null || amount === undefined || amount === "") {
    return "—";
  }
  const value = typeof amount === "string" ? Number(amount) : amount;
  const formatted = Number.isFinite(value)
    ? value.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    : String(amount);
  return currency ? `${formatted} ${currency}` : formatted;
};

const formatLabel = (value: string) =>
  value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");

const getRevenueStatusBadgeClass = (status: OfframpRevenueStatus | null) => {
  switch (status) {
    case "COLLECTED":
      return "bg-green-100 text-green-800";
    case "PENDING":
      return "bg-yellow-100 text-yellow-800";
    case "FAILED":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const getSourceBadgeClass = (source: OfframpSource) => {
  switch (source) {
    case "TEAM_FIAT":
      return "bg-blue-100 text-blue-800";
    case "COMPANY_FIAT":
      return "bg-indigo-100 text-indigo-800";
    case "TEAM_CRYPTO":
      return "bg-purple-100 text-purple-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export function OfframpRevenuePanel() {
  const [withdrawals, setWithdrawals] = useState<OfframpRevenueWithdrawal[]>(
    [],
  );
  const [stats, setStats] = useState<OfframpRevenueStats | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [filterStatus, setFilterStatus] = useState<OfframpRevenueStatus | "">(
    "",
  );
  const [filterSource, setFilterSource] = useState<OfframpSource | "">("");
  const [filterProvider, setFilterProvider] = useState<OfframpProvider | "">(
    "",
  );
  const [companyIdInput, setCompanyIdInput] = useState("");
  const [fromInput, setFromInput] = useState("");
  const [toInput, setToInput] = useState("");
  const [appliedCompanyId, setAppliedCompanyId] = useState("");
  const [appliedFrom, setAppliedFrom] = useState("");
  const [appliedTo, setAppliedTo] = useState("");

  const LIMIT = 20;

  useEffect(() => {
    const fetchOfframpRevenue = async () => {
      try {
        setLoading(true);
        setError("");
        const data = await dashboardAPI.getOfframpRevenue(page, LIMIT, {
          status: filterStatus || undefined,
          source: filterSource || undefined,
          provider: filterProvider || undefined,
          companyId: appliedCompanyId || undefined,
          from: appliedFrom || undefined,
          to: appliedTo || undefined,
        });
        setStats(data.stats);
        setWithdrawals(data.data);
        setTotal(data.meta.total);
        setTotalPages(data.meta.totalPages);
      } catch (err: any) {
        setError(
          err.response?.data?.message || "Failed to load offramp revenue",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchOfframpRevenue();
  }, [
    page,
    filterStatus,
    filterSource,
    filterProvider,
    appliedCompanyId,
    appliedFrom,
    appliedTo,
  ]);

  const applyFilters = () => {
    setAppliedCompanyId(companyIdInput.trim());
    setAppliedFrom(fromInput);
    setAppliedTo(toInput);
    setPage(1);
  };

  const clearFilters = () => {
    setFilterStatus("");
    setFilterSource("");
    setFilterProvider("");
    setCompanyIdInput("");
    setFromInput("");
    setToInput("");
    setAppliedCompanyId("");
    setAppliedFrom("");
    setAppliedTo("");
    setPage(1);
  };

  if (loading && withdrawals.length === 0 && !stats) {
    return (
      <div className="py-12 text-center">
        <p className="text-gray-600">Loading offramp revenue...</p>
      </div>
    );
  }

  const currency = stats?.currency || "USDC";

  const statCards = [
    {
      title: "Offramp Revenue",
      value: formatAmount(stats?.offrampRevenue || "0", currency),
      description: `Fees collected on completed cash-outs (${stats?.feePercent ?? 0}% fee)`,
    },
    {
      title: "Pending Revenue",
      value: formatAmount(stats?.pendingRevenue || "0", currency),
      description: "Fees still in flight",
    },
    {
      title: "Settled Cash-outs",
      value: (stats?.settledTransferCount || 0).toLocaleString(),
      description: "Collected fee transfers",
    },
    {
      title: "Pending Cash-outs",
      value: (stats?.pendingTransferCount || 0).toLocaleString(),
      description: "Initiated or processing transfers",
    },
  ];

  const sourceBreakdown = [
    {
      key: "teamFiat",
      title: "Team Fiat",
      data: stats?.bySource?.teamFiat,
    },
    {
      key: "companyFiat",
      title: "Company Fiat",
      data: stats?.bySource?.companyFiat,
    },
    {
      key: "teamCrypto",
      title: "Team Crypto",
      data: stats?.bySource?.teamCrypto,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.title} className="border border-gray-200 bg-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-700">
                {stat.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-xs text-gray-500">{stat.description}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {sourceBreakdown.map((source) => (
          <Card key={source.key} className="border border-gray-200 bg-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-700">
                {source.title}
              </CardTitle>
              <CardDescription>Collected vs pending by source</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Collected</span>
                <span className="font-medium text-gray-900">
                  {formatAmount(source.data?.collected || "0", currency)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Pending</span>
                <span className="font-medium text-gray-900">
                  {formatAmount(source.data?.pending || "0", currency)}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs text-gray-500 pt-1">
                <span>Settled: {source.data?.settledTransferCount ?? 0}</span>
                <span>Pending: {source.data?.pendingTransferCount ?? 0}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border border-gray-200 bg-white">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Filters</CardTitle>
          <CardDescription>
            Revenue status filters the list only. Totals still respect company,
            source, provider, and date range.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">
              Revenue status
            </p>
            <div className="flex flex-wrap gap-2">
              {REVENUE_STATUS_OPTIONS.map((option) => (
                <button
                  key={option.label}
                  onClick={() => {
                    setFilterStatus(option.value);
                    setPage(1);
                  }}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filterStatus === option.value
                      ? "bg-[#363636] text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Source</p>
            <div className="flex flex-wrap gap-2">
              {SOURCE_OPTIONS.map((option) => (
                <button
                  key={option.label}
                  onClick={() => {
                    setFilterSource(option.value);
                    setPage(1);
                  }}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filterSource === option.value
                      ? "bg-[#363636] text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Provider</p>
            <div className="flex flex-wrap gap-2">
              {PROVIDER_OPTIONS.map((option) => (
                <button
                  key={option.label}
                  onClick={() => {
                    setFilterProvider(option.value);
                    setPage(1);
                  }}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filterProvider === option.value
                      ? "bg-[#363636] text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Company ID
              </label>
              <Input
                value={companyIdInput}
                onChange={(e) => setCompanyIdInput(e.target.value)}
                placeholder="e.g. cmp_123"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">From</label>
              <Input
                type="date"
                value={fromInput}
                onChange={(e) => setFromInput(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">To</label>
              <Input
                type="date"
                value={toInput}
                onChange={(e) => setToInput(e.target.value)}
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={applyFilters}
              className="bg-[#363636] text-white hover:bg-gray-700"
            >
              Apply Filters
            </Button>
            <Button
              variant="outline"
              onClick={clearFilters}
              className="border border-gray-300 text-gray-700 hover:bg-gray-100"
            >
              Clear
            </Button>
          </div>
        </CardContent>
      </Card>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      <Card className="border border-gray-200 bg-white overflow-hidden">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">
            Cash-outs ({total})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading && withdrawals.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600">Loading cash-outs...</p>
            </div>
          ) : withdrawals.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600">No offramp cash-outs found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left px-4 py-3 font-semibold text-gray-900">
                      Date
                    </th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-900">
                      Company
                    </th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-900">
                      Member
                    </th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-900">
                      Source
                    </th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-900">
                      Provider
                    </th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-900">
                      Gross
                    </th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-900">
                      Fee
                    </th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-900">
                      Net
                    </th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-900">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {withdrawals.map((row) => (
                    <tr
                      key={row.withdrawalId}
                      className="border-b border-gray-100 hover:bg-gray-50"
                    >
                      <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                        {new Date(
                          row.transferDate || row.transactionTime,
                        ).toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900">
                          {row.company.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {row.company.id}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {row.member?.name || row.member?.email ? (
                          <>
                            <div className="font-medium text-gray-900">
                              {row.member.name || "—"}
                            </div>
                            <div className="text-xs text-gray-500">
                              {row.member.email || "—"}
                            </div>
                          </>
                        ) : (
                          <span className="text-gray-500">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <Badge className={getSourceBadgeClass(row.source)}>
                          {formatLabel(row.source)}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {row.provider ? formatLabel(row.provider) : "—"}
                      </td>
                      <td className="px-4 py-3 text-gray-900">
                        {formatAmount(row.grossAmount, row.currency)}
                        {row.localAmount && row.localCurrency ? (
                          <div className="text-xs text-gray-500">
                            {formatAmount(row.localAmount, row.localCurrency)}
                          </div>
                        ) : null}
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-900">
                        {formatAmount(row.feeAmount, row.currency)}
                        <div className="text-xs text-gray-500">
                          {row.feePercent}%
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-900">
                        {formatAmount(row.transferAmount, row.currency)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-1">
                          <Badge
                            className={getRevenueStatusBadgeClass(
                              row.revenueStatus,
                            )}
                          >
                            {row.revenueStatus || "—"}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            {row.status}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <PaginationControls
        currentPage={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />
    </div>
  );
}
