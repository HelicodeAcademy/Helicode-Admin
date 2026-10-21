/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useMemo, useState } from "react";
import { dashboardAPI, Signup } from "@/lib/api-services";
import { PaginationControls } from "@/components/pagination-controls";
import { DatePicker } from "@/components/admin/date-picker";
import { ExportButton } from "@/components/admin/export-button";
import { SearchInput } from "@/components/admin/search-input";
import { useDebounce } from "@/hooks/use-debounce";
import {
  KYC_STATUS_OPTIONS,
  SORT_OPTIONS,
  TOS_STATUS_OPTIONS,
  parseSort,
} from "@/lib/list-filter-options";
import {
  DataTable,
  EmptyRow,
  Field,
  NativeSelect,
  Notice,
  Page,
  PageHeader,
  Panel,
  Segmented,
  StatusPill,
  TableHead,
  TableSkeleton,
  formatDate,
  tdClass,
  thClass,
} from "@/components/admin/shell";

const LIMIT = 20;

export default function SignupsPage() {
  const [signups, setSignups] = useState<Signup[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [filterType, setFilterType] = useState<"company" | "team" | "">("");
  const [searchInput, setSearchInput] = useState("");
  const [kycStatus, setKycStatus] = useState("");
  const [tosStatus, setTosStatus] = useState("");
  const [country, setCountry] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [sortValue, setSortValue] = useState("createdAt:desc");
  const search = useDebounce(searchInput.trim());

  const filters = useMemo(() => {
    const { sort, order } = parseSort(sortValue);
    const canSortByName = filterType !== "";
    return {
      type: filterType || undefined,
      search: search || undefined,
      kycStatus: kycStatus || undefined,
      tosStatus: (tosStatus || undefined) as "pending" | "approved" | undefined,
      country: country.trim() || undefined,
      from: from || undefined,
      to: to || undefined,
      sort: canSortByName ? sort : "createdAt",
      order: canSortByName ? order : "desc",
    };
  }, [filterType, search, kycStatus, tosStatus, country, from, to, sortValue]);

  useEffect(() => {
    setPage(1);
  }, [filterType, search, kycStatus, tosStatus, country, from, to, sortValue]);

  useEffect(() => {
    const fetchSignups = async () => {
      try {
        setLoading(true);
        setError("");
        const data = await dashboardAPI.getSignups(page, LIMIT, filters);
        setSignups(data.data);
        setTotal(data.meta.total);
        setTotalPages(data.meta.totalPages);
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to load signups");
      } finally {
        setLoading(false);
      }
    };

    fetchSignups();
  }, [page, filters]);

  const handleExport = async () => {
    try {
      setExporting(true);
      setError("");
      setNotice("");
      const result = await dashboardAPI.exportSignupsCsv(filters);
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

  return (
    <Page>
      <PageHeader
        eyebrow="Directory"
        title="Signups"
        description={`${total.toLocaleString()} accounts`}
        action={<ExportButton loading={exporting} onClick={handleExport} />}
      />

      <div className="space-y-4">
        {error ? <Notice tone="error">{error}</Notice> : null}
        {notice ? <Notice tone="warning">{notice}</Notice> : null}

        <Panel>
          <div className="space-y-3 border-b border-line px-5 py-4">
            <Segmented
              value={filterType}
              onChange={setFilterType}
              options={[
                { label: "All", value: "" },
                { label: "Companies", value: "company" },
                { label: "Teams", value: "team" },
              ]}
            />

            <div className="grid gap-3 lg:grid-cols-[1fr_11rem_11rem_8rem]">
              <SearchInput
                value={searchInput}
                onChange={setSearchInput}
                placeholder="Search name, email, or company"
              />
              <NativeSelect
                value={kycStatus}
                onChange={setKycStatus}
                options={[...KYC_STATUS_OPTIONS]}
              />
              <NativeSelect
                value={tosStatus}
                onChange={setTosStatus}
                options={[...TOS_STATUS_OPTIONS]}
              />
              <NativeSelect
                value={filterType ? sortValue : "createdAt:desc"}
                onChange={setSortValue}
                options={
                  filterType
                    ? [...SORT_OPTIONS]
                    : SORT_OPTIONS.filter((option) =>
                        option.value.startsWith("createdAt"),
                      )
                }
              />
            </div>

            <div className="grid gap-3 md:grid-cols-[8rem_11.5rem_11.5rem]">
              <Field label="Country">
                <input
                  value={country}
                  onChange={(event) =>
                    setCountry(event.target.value.toUpperCase().slice(0, 8))
                  }
                  placeholder="NG"
                  className="h-10 rounded-md border border-line bg-surface px-3 text-sm text-ink"
                />
              </Field>
              <Field label="From">
                <DatePicker value={from} onChange={setFrom} />
              </Field>
              <Field label="To">
                <DatePicker value={to} onChange={setTo} />
              </Field>
            </div>
          </div>

          <DataTable>
            <TableHead>
              <th className={thClass}>Name</th>
              <th className={thClass}>Email</th>
              <th className={thClass}>Type</th>
              <th className={thClass}>Company</th>
              <th className={thClass}>KYC</th>
              <th className={thClass}>Terms</th>
              <th className={thClass}>Wallet</th>
              <th className={thClass}>Signed up</th>
            </TableHead>
            <tbody>
              {loading && signups.length === 0 ? (
                <TableSkeleton columns={8} />
              ) : signups.length === 0 ? (
                <EmptyRow colSpan={8}>No signups found</EmptyRow>
              ) : (
                signups.map((signup) => (
                  <tr
                    key={`${signup.type}-${signup.id}`}
                    className="border-b border-line last:border-0 hover:bg-surface-muted"
                  >
                    <td className={`${tdClass} font-medium`}>
                      {signup.fullName || "—"}
                    </td>
                    <td className={tdClass}>
                      {signup.employeeEmail || signup.email || "—"}
                    </td>
                    <td className={tdClass}>
                      <StatusPill
                        status="neutral"
                        label={signup.type === "company" ? "Company" : "Team"}
                      />
                    </td>
                    <td className={tdClass}>
                      {signup.companyName ||
                        signup.companies?.[0]?.companyName ||
                        signup.teamName ||
                        "—"}
                    </td>
                    <td className={tdClass}>
                      <StatusPill status={signup.kycStatus} />
                    </td>
                    <td className={tdClass}>
                      <StatusPill status={signup.tosStatus} />
                    </td>
                    <td className={tdClass}>
                      {signup.hasBridgeWallet == null
                        ? "—"
                        : signup.hasBridgeWallet
                          ? "Yes"
                          : "No"}
                    </td>
                    <td className={`${tdClass} whitespace-nowrap text-[#475467]`}>
                      {formatDate(signup.dateOfSignup)}
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
    </Page>
  );
}
