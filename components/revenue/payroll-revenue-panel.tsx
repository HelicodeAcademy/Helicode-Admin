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
  PayrollRevenueStats,
  PayrollRevenueTransfer,
  PayrollTransferStatus,
} from "@/lib/api-services";
import { PaginationControls } from "@/components/pagination-controls";

const STATUS_OPTIONS: Array<{
  label: string;
  value: PayrollTransferStatus | "";
}> = [
  { label: "All", value: "" },
  { label: "Initiated", value: "INITIATED" },
  { label: "Processing", value: "PROCESSING" },
  { label: "Successful", value: "SUCCESSFUL" },
  { label: "Failed", value: "FAILED" },
];

const formatAmount = (amount: string | number, currency?: string) => {
  const value = typeof amount === "string" ? Number(amount) : amount;
  const formatted = Number.isFinite(value)
    ? value.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    : String(amount);
  return currency ? `${formatted} ${currency}` : formatted;
};

const formatTransferType = (type: string) =>
  type
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

const getStatusBadgeClass = (status: PayrollTransferStatus) => {
  switch (status) {
    case "SUCCESSFUL":
      return "bg-green-100 text-green-800";
    case "PROCESSING":
    case "INITIATED":
      return "bg-yellow-100 text-yellow-800";
    case "FAILED":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export function PayrollRevenuePanel() {
  const [transfers, setTransfers] = useState<PayrollRevenueTransfer[]>([]);
  const [stats, setStats] = useState<PayrollRevenueStats | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [filterStatus, setFilterStatus] = useState<PayrollTransferStatus | "">(
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
    const fetchPayrollRevenue = async () => {
      try {
        setLoading(true);
        setError("");
        const data = await dashboardAPI.getPayrollRevenue(page, LIMIT, {
          status: filterStatus || undefined,
          companyId: appliedCompanyId || undefined,
          from: appliedFrom || undefined,
          to: appliedTo || undefined,
        });
        setStats(data.stats);
        setTransfers(data.data);
        setTotal(data.meta.total);
        setTotalPages(data.meta.totalPages);
      } catch (err: any) {
        setError(
          err.response?.data?.message || "Failed to load payroll revenue",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchPayrollRevenue();
  }, [page, filterStatus, appliedCompanyId, appliedFrom, appliedTo]);

  const applyFilters = () => {
    setAppliedCompanyId(companyIdInput.trim());
    setAppliedFrom(fromInput);
    setAppliedTo(toInput);
    setPage(1);
  };

  const clearFilters = () => {
    setFilterStatus("");
    setCompanyIdInput("");
    setFromInput("");
    setToInput("");
    setAppliedCompanyId("");
    setAppliedFrom("");
    setAppliedTo("");
    setPage(1);
  };

  if (loading && transfers.length === 0 && !stats) {
    return (
      <div className="py-12 text-center">
        <p className="text-gray-600">Loading payroll revenue...</p>
      </div>
    );
  }

  const currency = stats?.currency || "USDC";

  const statCards = [
    {
      title: "Payroll Revenue",
      value: formatAmount(stats?.payrollRevenue || "0", currency),
      description: `Fees collected on successful transfers (${stats?.feePercent ?? 0}% fee)`,
    },
    {
      title: "Pending Revenue",
      value: formatAmount(stats?.pendingRevenue || "0", currency),
      description: "Fees on initiated / processing transfers",
    },
    {
      title: "Settled Transfers",
      value: (stats?.settledTransferCount || 0).toLocaleString(),
      description: "Successful payroll transfers",
    },
    {
      title: "Pending Transfers",
      value: (stats?.pendingTransferCount || 0).toLocaleString(),
      description: "Initiated or processing transfers",
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

      <Card className="border border-gray-200 bg-white">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Filters</CardTitle>
          <CardDescription>
            Status filters the transfer list only. Revenue totals still respect
            company and date range.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {STATUS_OPTIONS.map((option) => (
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
            Transfers ({total})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading && transfers.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600">Loading transfers...</p>
            </div>
          ) : transfers.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600">No payroll transfers found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left px-4 py-3 font-semibold text-gray-900">
                      Company
                    </th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-900">
                      Recipient
                    </th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-900">
                      Type
                    </th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-900">
                      Net
                    </th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-900">
                      Gross
                    </th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-900">
                      Fee
                    </th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-900">
                      Status
                    </th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-900">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {transfers.map((transfer) => (
                    <tr
                      key={transfer.transactionId}
                      className="border-b border-gray-100 hover:bg-gray-50"
                    >
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900">
                          {transfer.company.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {transfer.company.id}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900">
                          {transfer.recipient.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {transfer.recipient.email}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {formatTransferType(transfer.transferType)}
                      </td>
                      <td className="px-4 py-3 text-gray-900">
                        {formatAmount(
                          transfer.transferAmount,
                          transfer.currency,
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-900">
                        {formatAmount(transfer.grossAmount, transfer.currency)}
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-900">
                        {formatAmount(transfer.feeAmount, transfer.currency)}
                      </td>
                      <td className="px-4 py-3">
                        <Badge className={getStatusBadgeClass(transfer.status)}>
                          {transfer.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {new Date(
                          transfer.transferDate || transfer.transactionTime,
                        ).toLocaleString()}
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
