/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/admin/date-picker";
import { ExportButton } from "@/components/admin/export-button";
import {
  dashboardAPI,
  PayrollRevenueStats,
  PayrollRevenueTransfer,
  PayrollTransferStatus,
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

export function PayrollRevenuePanel() {
  const [transfers, setTransfers] = useState<PayrollRevenueTransfer[]>([]);
  const [stats, setStats] = useState<PayrollRevenueStats | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const [filterStatus, setFilterStatus] = useState<PayrollTransferStatus | "">(
    "",
  );
  const [companySearchInput, setCompanySearchInput] = useState("");
  const [fromInput, setFromInput] = useState("");
  const [toInput, setToInput] = useState("");
  const [appliedCompanySearch, setAppliedCompanySearch] = useState("");
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
          companySearch: appliedCompanySearch || undefined,
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
  }, [page, filterStatus, appliedCompanySearch, appliedFrom, appliedTo]);

  const listFilters = {
    status: filterStatus || undefined,
    companySearch: appliedCompanySearch || undefined,
    from: appliedFrom || undefined,
    to: appliedTo || undefined,
  };

  const applyFilters = () => {
    setAppliedCompanySearch(companySearchInput.trim());
    setAppliedFrom(fromInput);
    setAppliedTo(toInput);
    setPage(1);
  };

  const clearFilters = () => {
    setFilterStatus("");
    setCompanySearchInput("");
    setFromInput("");
    setToInput("");
    setAppliedCompanySearch("");
    setAppliedFrom("");
    setAppliedTo("");
    setPage(1);
  };

  const handleExport = async () => {
    try {
      setExporting(true);
      setError("");
      setNotice("");
      const result = await dashboardAPI.exportPayrollRevenueCsv(listFilters);
      if (result.truncated) {
        setNotice(
          "Export was cut off at 10,000 rows. Narrow your filters and export again.",
        );
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Failed to export CSV");
    } finally {
      setExporting(false);
    }
  };

  const currency = stats?.currency || "USDC";

  return (
    <div className="space-y-4">
      <Panel className="px-5">
        {loading && !stats ? (
          <div className="grid gap-4 py-4 md:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="h-16 animate-pulse rounded bg-surface-muted" />
            ))}
          </div>
        ) : (
          <div className="grid divide-y divide-line md:grid-cols-4 md:divide-x md:divide-y-0">
            <Metric
              label="Collected"
              value={<Money amount={stats?.payrollRevenue || "0"} currency={currency} />}
              detail={`${stats?.feePercent ?? 0}% fee on successful transfers`}
            />
            <Metric
              label="Pending"
              value={<Money amount={stats?.pendingRevenue || "0"} currency={currency} />}
              detail="Initiated or processing"
            />
            <Metric
              label="Settled"
              value={(stats?.settledTransferCount || 0).toLocaleString()}
              detail="Successful transfers"
            />
            <Metric
              label="In flight"
              value={(stats?.pendingTransferCount || 0).toLocaleString()}
              detail="Awaiting settlement"
            />
          </div>
        )}
      </Panel>

      <Panel>
        <div className="space-y-4 border-b border-line px-5 py-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="mb-2 text-xs font-medium text-ink-muted">Status</p>
              <Segmented
                value={filterStatus}
                onChange={(value) => {
                  setFilterStatus(value);
                  setPage(1);
                }}
                options={STATUS_OPTIONS}
              />
            </div>
            <ExportButton loading={exporting} onClick={handleExport} />
          </div>

          <form
            className="grid gap-3 md:grid-cols-[1fr_11.5rem_11.5rem_auto]"
            onSubmit={(event) => {
              event.preventDefault();
              applyFilters();
            }}
          >
            <Field label="Company">
              <Input
                value={companySearchInput}
                onChange={(e) => setCompanySearchInput(e.target.value.slice(0, 100))}
                placeholder="Search company name"
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
                className="h-10 bg-ink px-4 text-canvas hover:bg-ink/90"
              >
                Apply
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={clearFilters}
                className="h-10 border-line-strong bg-surface text-ink-secondary hover:bg-surface-muted"
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
        {notice ? (
          <div className="px-5 pt-4">
            <Notice tone="warning">{notice}</Notice>
          </div>
        ) : null}

        <DataTable>
          <TableHead>
            <th className={thClass}>Company</th>
            <th className={thClass}>Recipient</th>
            <th className={thClass}>Type</th>
            <th className={`${thClass} text-right`}>Net</th>
            <th className={`${thClass} text-right`}>Gross</th>
            <th className={`${thClass} text-right`}>Fee</th>
            <th className={thClass}>Status</th>
            <th className={thClass}>Date</th>
          </TableHead>
          <tbody>
            {loading && transfers.length === 0 ? (
              <TableSkeleton columns={8} />
            ) : transfers.length === 0 ? (
              <EmptyRow colSpan={8}>No payroll transfers found</EmptyRow>
            ) : (
              transfers.map((transfer) => (
                <tr
                  key={transfer.transactionId}
                  className="border-b border-line last:border-0 hover:bg-surface-muted"
                >
                  <td className={tdClass}>
                    <div className="font-medium">{transfer.company.name}</div>
                    <div className="text-xs text-ink-muted">
                      {transfer.company.id}
                    </div>
                  </td>
                  <td className={tdClass}>
                    <div className="font-medium">{transfer.recipient.name}</div>
                    <div className="text-xs text-ink-muted">
                      {transfer.recipient.email}
                    </div>
                  </td>
                  <td className={tdClass}>
                    {formatLabel(transfer.transferType)}
                  </td>
                  <td className={`${tdClass} text-right`}>
                    <Money
                      amount={transfer.transferAmount}
                      currency={transfer.currency}
                    />
                  </td>
                  <td className={`${tdClass} text-right`}>
                    <Money
                      amount={transfer.grossAmount}
                      currency={transfer.currency}
                    />
                  </td>
                  <td className={`${tdClass} text-right`}>
                    <Money
                      amount={transfer.feeAmount}
                      currency={transfer.currency}
                    />
                  </td>
                  <td className={tdClass}>
                    <StatusPill status={transfer.status} />
                  </td>
                  <td className={`${tdClass} whitespace-nowrap text-[#475467]`}>
                    {formatDate(
                      transfer.transferDate || transfer.transactionTime,
                    )}
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
