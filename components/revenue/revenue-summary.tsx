/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import {
  dashboardAPI,
  OfframpRevenueStats,
  PayrollRevenueStats,
} from "@/lib/api-services";
import { Metric, Money, Notice, Panel } from "@/components/admin/shell";
import { fromCents, toCents } from "@/lib/money";
import { formatRangeLabel } from "@/lib/utc-period";

export function RevenueSummary({
  from,
  to,
}: {
  from?: string;
  to?: string;
}) {
  const [payroll, setPayroll] = useState<PayrollRevenueStats | null>(null);
  const [offramp, setOfframp] = useState<OfframpRevenueStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const rangeLabel = formatRangeLabel(from, to);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        setLoading(true);
        setError("");
        const dateFilters =
          from || to ? { from: from || undefined, to: to || undefined } : undefined;
        const [payrollResult, offrampResult] = await Promise.allSettled([
          dashboardAPI.getPayrollRevenue(1, 1, dateFilters),
          dashboardAPI.getOfframpRevenue(1, 1, dateFilters),
        ]);

        if (cancelled) return;

        if (payrollResult.status === "fulfilled") {
          setPayroll(payrollResult.value.stats);
        }
        if (offrampResult.status === "fulfilled") {
          setOfframp(offrampResult.value.stats);
        }

        if (
          payrollResult.status === "rejected" &&
          offrampResult.status === "rejected"
        ) {
          const reason = payrollResult.reason as any;
          setError(
            reason?.response?.data?.message || "Failed to load revenue totals",
          );
        } else if (
          payrollResult.status === "rejected" ||
          offrampResult.status === "rejected"
        ) {
          setError("One revenue source failed to load. Totals are incomplete.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, [from, to]);

  const currency = payroll?.currency || offramp?.currency || "USDC";
  const sameCurrency =
    !payroll?.currency ||
    !offramp?.currency ||
    payroll.currency === offramp.currency;

  const collected = sameCurrency
    ? fromCents(
        toCents(payroll?.payrollRevenue) + toCents(offramp?.offrampRevenue),
      )
    : null;
  const pending = sameCurrency
    ? fromCents(
        toCents(payroll?.pendingRevenue) + toCents(offramp?.pendingRevenue),
      )
    : null;

  return (
    <div className="mb-4 space-y-3">
      {error ? <Notice tone="error">{error}</Notice> : null}
      <Panel className="px-5">
        {loading ? (
          <div className="grid gap-4 py-4 md:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="h-16 animate-pulse rounded bg-surface-muted"
              />
            ))}
          </div>
        ) : (
          <div className="grid divide-y divide-line md:grid-cols-4 md:divide-x md:divide-y-0">
            <Metric
              label="Total collected"
              value={
                collected === null ? (
                  "—"
                ) : (
                  <Money amount={collected} currency={currency} />
                )
              }
              detail={rangeLabel === "All time" ? "Payroll and offramp fees" : rangeLabel}
            />
            <Metric
              label="Payroll"
              value={
                <Money
                  amount={payroll?.payrollRevenue || "0"}
                  currency={payroll?.currency || currency}
                />
              }
              detail={`${(payroll?.settledTransferCount || 0).toLocaleString()} settled`}
            />
            <Metric
              label="Offramp"
              value={
                <Money
                  amount={offramp?.offrampRevenue || "0"}
                  currency={offramp?.currency || currency}
                />
              }
              detail={`${(offramp?.settledTransferCount || 0).toLocaleString()} settled`}
            />
            <Metric
              label="Pending"
              value={
                pending === null ? (
                  "—"
                ) : (
                  <Money amount={pending} currency={currency} />
                )
              }
              detail="Fees still in flight"
            />
          </div>
        )}
      </Panel>
    </div>
  );
}
