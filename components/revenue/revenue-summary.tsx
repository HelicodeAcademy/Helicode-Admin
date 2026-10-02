/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import {
  dashboardAPI,
  OfframpRevenueStats,
  PayrollRevenueStats,
} from "@/lib/api-services";
import { Metric, Money, Notice, Panel } from "@/components/admin/shell";

function toCents(amount: string | undefined) {
  const [whole = "0", fraction = "00"] = (amount || "0").split(".");
  const dollars = Number(whole);
  const cents = Number(fraction.padEnd(2, "0").slice(0, 2));
  if (!Number.isFinite(dollars) || !Number.isFinite(cents)) return 0;
  return dollars * 100 + cents;
}

function fromCents(cents: number) {
  const whole = Math.floor(cents / 100);
  const fraction = String(cents % 100).padStart(2, "0");
  return `${whole}.${fraction}`;
}

export function RevenueSummary() {
  const [payroll, setPayroll] = useState<PayrollRevenueStats | null>(null);
  const [offramp, setOfframp] = useState<OfframpRevenueStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const [payrollResult, offrampResult] = await Promise.allSettled([
          dashboardAPI.getPayrollRevenue(1, 1),
          dashboardAPI.getOfframpRevenue(1, 1),
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
  }, []);

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
                className="h-16 animate-pulse rounded bg-[#F2F4F7]"
              />
            ))}
          </div>
        ) : (
          <div className="grid divide-y divide-[#E4E7EC] md:grid-cols-4 md:divide-x md:divide-y-0">
            <Metric
              label="Total collected"
              value={
                collected === null ? (
                  "—"
                ) : (
                  <Money amount={collected} currency={currency} />
                )
              }
              detail="Payroll and offramp fees"
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
