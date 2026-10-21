/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { dashboardAPI, StatsResponse } from "@/lib/api-services";
import {
  Metric,
  Money,
  Notice,
  Page,
  PageHeader,
  Panel,
} from "@/components/admin/shell";

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
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to load stats");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const currencyEntries = Object.entries(stats?.volume.byCurrency ?? {});
  const walletEntries = Object.entries(stats?.volume.byWalletType ?? {});
  const currencyMax = Math.max(
    ...currencyEntries.map(([, amount]) => Number(amount) || 0),
    1,
  );
  const walletMax = Math.max(
    ...walletEntries.map(([, amount]) => Number(amount) || 0),
    1,
  );

  return (
    <Page>
      <PageHeader
        eyebrow="Overview"
        title="Dashboard"
        description="Signup, business, and volume totals across the platform."
      />

      {error ? (
        <Notice tone="error">{error}</Notice>
      ) : (
        <div className="space-y-4">
          <Panel className="px-5">
            {loading && !stats ? (
              <div className="grid gap-4 py-4 md:grid-cols-4">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="space-y-2 py-2">
                    <div className="h-3 w-20 animate-pulse rounded bg-surface-muted" />
                    <div className="h-7 w-24 animate-pulse rounded bg-surface-muted" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid divide-y divide-line md:grid-cols-4 md:divide-x md:divide-y-0">
                <Metric
                  label="Signups"
                  value={stats?.totalSignups.toLocaleString() || "0"}
                  detail="Registered accounts"
                />
                <Metric
                  label="Businesses"
                  value={stats?.activeBusinesses.toLocaleString() || "0"}
                  detail="Currently active"
                />
                <Metric
                  label="Teams"
                  value={stats?.activeTeams.toLocaleString() || "0"}
                  detail="Currently active"
                />
                <Metric
                  label="Volume"
                  value={<Money amount={stats?.volume.total || 0} />}
                  detail="All recorded volume"
                />
              </div>
            )}
          </Panel>

          <div className="grid gap-4 lg:grid-cols-2">
            <Breakdown
              title="Volume by currency"
              empty="No currency volume yet."
              rows={currencyEntries.map(([label, amount]) => ({
                label,
                amount: Number(amount) || 0,
                share: ((Number(amount) || 0) / currencyMax) * 100,
              }))}
            />
            <Breakdown
              title="Volume by wallet"
              empty="No wallet volume yet."
              rows={walletEntries.map(([label, amount]) => ({
                label,
                amount: Number(amount) || 0,
                share: ((Number(amount) || 0) / walletMax) * 100,
              }))}
            />
          </div>
        </div>
      )}
    </Page>
  );
}

function Breakdown({
  title,
  rows,
  empty,
}: {
  title: string;
  empty: string;
  rows: Array<{ label: string; amount: number; share: number }>;
}) {
  return (
    <Panel className="p-5">
      <h2 className="text-sm font-semibold text-ink">{title}</h2>
      {rows.length === 0 ? (
        <p className="mt-6 text-sm text-ink-muted">{empty}</p>
      ) : (
        <ul className="mt-4 space-y-3.5">
          {rows.map((row) => (
            <li key={row.label}>
              <div className="mb-1.5 flex items-baseline justify-between gap-4">
                <span className="text-sm text-ink-secondary">{row.label}</span>
                <Money amount={row.amount} />
              </div>
              <div className="h-1 overflow-hidden rounded-full bg-surface-muted">
                <div
                  className="h-full rounded-full bg-ink"
                  style={{ width: `${Math.max(row.share, 2)}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}
