/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/admin/date-picker";
import {
  dashboardAPI,
  OfframpProvider,
  OfframpRevenueStats,
  OfframpRevenueStatus,
  OfframpRevenueWithdrawal,
  OfframpSource,
} from "@/lib/api-services";
import { PaginationControls } from "@/components/pagination-controls";
import {
  DataTable,
  EmptyRow,
  Field,
  Metric,
  Money,
  Notice,
  Panel,
  Segmented,
  StatusPill,
  TableHead,
  TableSkeleton,
  fieldClassName,
  formatDate,
  formatLabel,
  tdClass,
  thClass,
} from "@/components/admin/shell";

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
  { label: "Team fiat", value: "TEAM_FIAT" },
  { label: "Company fiat", value: "COMPANY_FIAT" },
  { label: "Team crypto", value: "TEAM_CRYPTO" },
];

const PROVIDER_OPTIONS: Array<{ label: string; value: OfframpProvider | "" }> =
  [
    { label: "All providers", value: "" },
    { label: "Yellowcard", value: "YELLOWCARD" },
    { label: "Quidax", value: "QUIDAX" },
  ];

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

  const currency = stats?.currency || "USDC";
  const sources = [
    { key: "teamFiat", title: "Team fiat", data: stats?.bySource?.teamFiat },
    {
      key: "companyFiat",
      title: "Company fiat",
      data: stats?.bySource?.companyFiat,
    },
    {
      key: "teamCrypto",
      title: "Team crypto",
      data: stats?.bySource?.teamCrypto,
    },
  ];

  return (
    <div className="space-y-4">
      <Panel className="px-5">
        {loading && !stats ? (
          <div className="grid gap-4 py-4 md:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="h-16 animate-pulse rounded bg-[#F2F4F7]" />
            ))}
          </div>
        ) : (
          <div className="grid divide-y divide-[#E4E7EC] md:grid-cols-4 md:divide-x md:divide-y-0">
            <Metric
              label="Collected"
              value={
                <Money amount={stats?.offrampRevenue || "0"} currency={currency} />
              }
              detail={`${stats?.feePercent ?? 0}% fee on settled cash-outs`}
            />
            <Metric
              label="Pending"
              value={
                <Money amount={stats?.pendingRevenue || "0"} currency={currency} />
              }
              detail="Fees still in flight"
            />
            <Metric
              label="Settled"
              value={(stats?.settledTransferCount || 0).toLocaleString()}
              detail="Collected cash-outs"
            />
            <Metric
              label="In flight"
              value={(stats?.pendingTransferCount || 0).toLocaleString()}
              detail="Awaiting settlement"
            />
          </div>
        )}
      </Panel>

      <Panel className="overflow-hidden">
        <div className="grid divide-y divide-[#E4E7EC] md:grid-cols-3 md:divide-x md:divide-y-0">
          {sources.map((source) => (
            <div key={source.key} className="px-5 py-4">
              <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-[#667085]">
                {source.title}
              </p>
              <div className="mt-3 flex items-baseline justify-between gap-3">
                <span className="text-xs text-[#667085]">Collected</span>
                <Money amount={source.data?.collected || "0"} currency={currency} />
              </div>
              <div className="mt-1.5 flex items-baseline justify-between gap-3">
                <span className="text-xs text-[#667085]">Pending</span>
                <Money amount={source.data?.pending || "0"} currency={currency} />
              </div>
              <p className="mt-3 text-xs text-[#98A2B3]">
                {source.data?.settledTransferCount ?? 0} settled ·{" "}
                {source.data?.pendingTransferCount ?? 0} pending
              </p>
            </div>
          ))}
        </div>
      </Panel>

      <Panel>
        <div className="space-y-4 border-b border-[#E4E7EC] px-5 py-4">
          <div className="flex flex-col gap-4">
            <div>
              <p className="mb-2 text-xs font-medium text-[#667085]">
                Revenue status
              </p>
              <Segmented
                value={filterStatus}
                onChange={(value) => {
                  setFilterStatus(value);
                  setPage(1);
                }}
                options={REVENUE_STATUS_OPTIONS}
              />
            </div>
            <div>
              <p className="mb-2 text-xs font-medium text-[#667085]">Source</p>
              <Segmented
                value={filterSource}
                onChange={(value) => {
                  setFilterSource(value);
                  setPage(1);
                }}
                options={SOURCE_OPTIONS}
              />
            </div>
            <div>
              <p className="mb-2 text-xs font-medium text-[#667085]">Provider</p>
              <Segmented
                value={filterProvider}
                onChange={(value) => {
                  setFilterProvider(value);
                  setPage(1);
                }}
                options={PROVIDER_OPTIONS}
              />
            </div>
          </div>

          <form
            className="grid gap-3 md:grid-cols-[1fr_11.5rem_11.5rem_auto]"
            onSubmit={(event) => {
              event.preventDefault();
              applyFilters();
            }}
          >
            <Field label="Company ID">
              <Input
                value={companyIdInput}
                onChange={(e) => setCompanyIdInput(e.target.value)}
                placeholder="cmp_123"
                className={fieldClassName()}
              />
            </Field>
            <Field label="From">
              <DatePicker value={fromInput} onChange={setFromInput} />
            </Field>
            <Field label="To">
              <DatePicker value={toInput} onChange={setToInput} />
            </Field>
            <div className="flex items-end gap-2">
              <Button
                type="submit"
                className="h-10 bg-[#0F112A] px-4 text-white hover:bg-[#1D2033]"
              >
                Apply
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={clearFilters}
                className="h-10 border-[#D0D5DD] bg-white text-[#344054] hover:bg-[#F9FAFB]"
              >
                Clear
              </Button>
            </div>
          </form>
        </div>

        {error ? (
          <div className="px-5 pt-4">
            <Notice tone="error">{error}</Notice>
          </div>
        ) : null}

        <DataTable>
          <TableHead>
            <th className={thClass}>Date</th>
            <th className={thClass}>Company</th>
            <th className={thClass}>Member</th>
            <th className={thClass}>Source</th>
            <th className={thClass}>Provider</th>
            <th className={`${thClass} text-right`}>Gross</th>
            <th className={`${thClass} text-right`}>Fee</th>
            <th className={`${thClass} text-right`}>Net</th>
            <th className={thClass}>Status</th>
          </TableHead>
          <tbody>
            {loading && withdrawals.length === 0 ? (
              <TableSkeleton columns={9} />
            ) : withdrawals.length === 0 ? (
              <EmptyRow colSpan={9}>No offramp cash-outs found</EmptyRow>
            ) : (
              withdrawals.map((row) => (
                <tr
                  key={row.withdrawalId}
                  className="border-b border-[#E4E7EC] last:border-0 hover:bg-[#F9FAFB]"
                >
                  <td className={`${tdClass} whitespace-nowrap text-[#475467]`}>
                    {formatDate(row.transferDate || row.transactionTime)}
                  </td>
                  <td className={tdClass}>
                    <div className="font-medium">{row.company.name}</div>
                    <div className="text-xs text-[#667085]">{row.company.id}</div>
                  </td>
                  <td className={tdClass}>
                    {row.member?.name || row.member?.email ? (
                      <>
                        <div className="font-medium">{row.member.name || "—"}</div>
                        <div className="text-xs text-[#667085]">
                          {row.member.email || "—"}
                        </div>
                      </>
                    ) : (
                      <span className="text-[#98A2B3]">—</span>
                    )}
                  </td>
                  <td className={tdClass}>{formatLabel(row.source)}</td>
                  <td className={tdClass}>
                    {row.provider ? formatLabel(row.provider) : "—"}
                  </td>
                  <td className={`${tdClass} text-right`}>
                    <Money amount={row.grossAmount} currency={row.currency} />
                    {row.localAmount && row.localCurrency ? (
                      <div className="text-xs text-[#667085]">
                        {row.localAmount} {row.localCurrency}
                      </div>
                    ) : null}
                  </td>
                  <td className={`${tdClass} text-right`}>
                    <Money amount={row.feeAmount} currency={row.currency} />
                    <div className="text-xs text-[#667085]">{row.feePercent}%</div>
                  </td>
                  <td className={`${tdClass} text-right`}>
                    <Money amount={row.transferAmount} currency={row.currency} />
                  </td>
                  <td className={tdClass}>
                    <StatusPill status={row.revenueStatus} />
                    <div className="mt-1 text-xs text-[#98A2B3]">
                      {formatLabel(row.status)}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </DataTable>

        <PaginationControls
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      </Panel>
    </div>
  );
}
