/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  CountryStat,
  dashboardAPI,
  StatsResponse,
  VolumeSnapshot,
} from "@/lib/api-services";
import { DatePicker } from "@/components/admin/date-picker";
import { RevenueSummary } from "@/components/revenue/revenue-summary";
import { Button } from "@/components/ui/button";
import {
  Field,
  Metric,
  Money,
  Notice,
  Page,
  PageHeader,
  Panel,
} from "@/components/admin/shell";
import {
  formatRangeLabel,
  monthDateRange,
  utcMonthKey,
  utcShiftedMonthKey,
} from "@/lib/utc-period";

function walletEntries(volume?: VolumeSnapshot) {
  const typed = Object.entries(volume?.byWalletType ?? {});
  if (typed.length > 0) return typed;
  return [
    ["Company wallets", volume?.companyWalletVolume ?? 0],
    ["Team wallets", volume?.teamWalletVolume ?? 0],
  ] as Array<[string, number]>;
}

export default function DashboardPage() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [countries, setCountries] = useState<CountryStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const hasRange = Boolean(from || to);

  useEffect(() => {
    const loadCountries = async () => {
      try {
        const data = await dashboardAPI.getCountries();
        setCountries(data ?? []);
      } catch {
        setNotice("Country breakdown failed to load.");
      }
    };

    void loadCountries();
  }, []);

  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoading(true);
        setError("");
        const data = await dashboardAPI.getStats(
          hasRange
            ? { from: from || undefined, to: to || undefined }
            : undefined,
        );
        setStats(data);
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to load dashboard stats");
      } finally {
        setLoading(false);
      }
    };

    void loadStats();
  }, [from, hasRange, to]);

  const currencyEntries = Object.entries(stats?.volume.byCurrency ?? {});
  const wallets = walletEntries(stats?.volume);
  const currencyMax = Math.max(
    ...currencyEntries.map(([, amount]) => Number(amount) || 0),
    1,
  );
  const walletMax = Math.max(
    ...wallets.map(([, amount]) => Number(amount) || 0),
    1,
  );
  const periodVolume = stats?.volumeForRange;
  const rangeLabel = formatRangeLabel(from, to);

  const applyMonth = (month: string) => {
    const range = monthDateRange(month);
    setFrom(range.from);
    setTo(range.to);
  };

  return (
    <Page>
      <PageHeader
        eyebrow="Overview"
        title="Dashboard"
        description="Signup, business, volume, and revenue across the platform."
      />

      <Panel className="mb-4 px-5 py-4">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
          <div className="grid flex-1 gap-3 sm:grid-cols-2 lg:grid-cols-[11.5rem_11.5rem_auto]">
            <Field label="From">
              <DatePicker value={from} onChange={setFrom} />
            </Field>
            <Field label="To">
              <DatePicker value={to} onChange={setTo} />
            </Field>
            <div className="flex flex-wrap items-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => applyMonth(utcMonthKey())}
                className="h-10 border-line-strong bg-surface text-ink-secondary hover:bg-surface-muted"
              >
                This month
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => applyMonth(utcShiftedMonthKey(-1))}
                className="h-10 border-line-strong bg-surface text-ink-secondary hover:bg-surface-muted"
              >
                Last month
              </Button>
              {hasRange ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setFrom("");
                    setTo("");
                  }}
                  className="h-10 border-line-strong bg-surface text-ink-secondary hover:bg-surface-muted"
                >
                  All time
                </Button>
              ) : null}
            </div>
          </div>
          <p className="text-sm text-ink-muted">{rangeLabel}</p>
        </div>
      </Panel>

      {error ? <Notice tone="error">{error}</Notice> : null}
      {notice ? <Notice tone="warning">{notice}</Notice> : null}

      {!error ? (
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

          {hasRange && periodVolume ? (
            <Panel className="px-5">
              <div className="grid divide-y divide-line md:grid-cols-2 md:divide-x md:divide-y-0">
                <Metric
                  label="Volume in range"
                  value={<Money amount={periodVolume.total || 0} />}
                  detail={rangeLabel}
                />
                <Metric
                  label="Transactions"
                  value={(periodVolume.transactionCount || 0).toLocaleString()}
                  detail="In the selected dates"
                />
              </div>
            </Panel>
          ) : null}

          <RevenueSummary from={from || undefined} to={to || undefined} />

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
              rows={wallets.map(([label, amount]) => ({
                label,
                amount: Number(amount) || 0,
                share: ((Number(amount) || 0) / walletMax) * 100,
              }))}
            />
          </div>

          <CountriesPanel
            countries={countries}
            loading={countries.length === 0 && !notice}
          />
        </div>
      ) : null}
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

function CountriesPanel({
  countries,
  loading,
}: {
  countries: CountryStat[];
  loading: boolean;
}) {
  return (
    <Panel>
      <div className="border-b border-line px-5 py-4">
        <h2 className="text-sm font-semibold text-ink">Active by country</h2>
        <p className="mt-1 text-sm text-ink-muted">
          Approved companies and employees with a Bridge wallet.
        </p>
      </div>
      {loading ? (
        <div className="space-y-3 px-5 py-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-8 animate-pulse rounded bg-surface-muted" />
          ))}
        </div>
      ) : countries.length === 0 ? (
        <p className="px-5 py-12 text-center text-sm text-ink-muted">
          No country data yet.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-line bg-surface-muted">
                <th className="px-5 py-3 text-left text-[11px] font-medium uppercase tracking-[0.06em] text-ink-muted">
                  Country
                </th>
                <th className="px-5 py-3 text-right text-[11px] font-medium uppercase tracking-[0.06em] text-ink-muted">
                  Companies
                </th>
                <th className="px-5 py-3 text-right text-[11px] font-medium uppercase tracking-[0.06em] text-ink-muted">
                  Employees
                </th>
              </tr>
            </thead>
            <tbody>
              {countries.map((row) => {
                const countryQuery = encodeURIComponent(row.country);
                return (
                  <tr
                    key={row.country}
                    className="border-b border-line last:border-0"
                  >
                    <td className="px-5 py-4 text-sm font-medium text-ink">
                      {row.country}
                    </td>
                    <td className="px-5 py-4 text-right text-sm tabular-nums">
                      <Link
                        href={`/dashboard/signups?type=company&country=${countryQuery}&active=true`}
                        className="text-ink hover:text-brand"
                      >
                        {row.activeCompanies.toLocaleString()}
                      </Link>
                    </td>
                    <td className="px-5 py-4 text-right text-sm tabular-nums">
                      <Link
                        href={`/dashboard/teams?country=${countryQuery}&active=true`}
                        className="text-ink hover:text-brand"
                      >
                        {row.activeTeams.toLocaleString()}
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </Panel>
  );
}
