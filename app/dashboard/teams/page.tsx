/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useMemo, useState } from "react";
import { dashboardAPI, TeamMember } from "@/lib/api-services";
import { PaginationControls } from "@/components/pagination-controls";
import { DatePicker } from "@/components/admin/date-picker";
import { ExportButton } from "@/components/admin/export-button";
import { SearchInput } from "@/components/admin/search-input";
import { useDebounce } from "@/hooks/use-debounce";
import {
  KYC_STATUS_OPTIONS,
  SORT_OPTIONS,
  parseSort,
} from "@/lib/list-filter-options";
import {
  DataTable,
  EmptyRow,
  Field,
  Money,
  NativeSelect,
  Notice,
  Page,
  PageHeader,
  Panel,
  StatusPill,
  TableHead,
  TableSkeleton,
  fieldClassName,
  formatDate,
  tdClass,
  thClass,
} from "@/components/admin/shell";

const LIMIT = 20;

export default function TeamsPage() {
  const [teams, setTeams] = useState<TeamMember[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [kycStatus, setKycStatus] = useState("");
  const [country, setCountry] = useState("");
  const [companyId, setCompanyId] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [sortValue, setSortValue] = useState("createdAt:desc");
  const search = useDebounce(searchInput.trim());

  const filters = useMemo(() => {
    const { sort, order } = parseSort(sortValue);
    return {
      search: search || undefined,
      kycStatus: kycStatus || undefined,
      country: country.trim() || undefined,
      companyId: companyId.trim() || undefined,
      from: from || undefined,
      to: to || undefined,
      sort,
      order,
    };
  }, [search, kycStatus, country, companyId, from, to, sortValue]);

  const resetPage = () => setPage(1);

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        setLoading(true);
        setError("");
        const data = await dashboardAPI.getTeams(page, LIMIT, filters);
        setTeams(data.data);
        setTotal(data.meta.total);
        setTotalPages(data.meta.totalPages);
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to load teams");
      } finally {
        setLoading(false);
      }
    };

    fetchTeams();
  }, [page, filters]);

  const handleExport = async () => {
    try {
      setExporting(true);
      setError("");
      setNotice("");
      const result = await dashboardAPI.exportTeamsCsv(filters);
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
        title="Teams"
        description={`${total.toLocaleString()} team members`}
        action={<ExportButton loading={exporting} onClick={handleExport} />}
      />

      <div className="space-y-4">
        {error ? <Notice tone="error">{error}</Notice> : null}
        {notice ? <Notice tone="warning">{notice}</Notice> : null}

        <Panel>
          <div className="space-y-3 border-b border-line px-5 py-4">
            <div className="grid gap-3 lg:grid-cols-[1fr_11rem_10rem]">
              <SearchInput
                value={searchInput}
                onChange={(value) => {
                  setSearchInput(value);
                  resetPage();
                }}
                placeholder="Search name, email, or company"
              />
              <NativeSelect
                value={kycStatus}
                onChange={(value) => {
                  setKycStatus(value);
                  resetPage();
                }}
                options={[...KYC_STATUS_OPTIONS]}
              />
              <NativeSelect
                value={sortValue}
                onChange={(value) => {
                  setSortValue(value);
                  resetPage();
                }}
                options={[...SORT_OPTIONS]}
              />
            </div>
            <div className="grid gap-3 md:grid-cols-[8rem_1fr_11.5rem_11.5rem]">
              <Field label="Country">
                <input
                  value={country}
                  onChange={(event) => {
                    setCountry(event.target.value.toUpperCase().slice(0, 8));
                    resetPage();
                  }}
                  placeholder="NG"
                  className={fieldClassName()}
                />
              </Field>
              <Field label="Company ID">
                <input
                  value={companyId}
                  onChange={(event) => {
                    setCompanyId(event.target.value);
                    resetPage();
                  }}
                  placeholder="Company ID"
                  className={fieldClassName()}
                />
              </Field>
              <Field label="From">
                <DatePicker
                  value={from}
                  onChange={(value) => {
                    setFrom(value);
                    resetPage();
                  }}
                />
              </Field>
              <Field label="To">
                <DatePicker
                  value={to}
                  onChange={(value) => {
                    setTo(value);
                    resetPage();
                  }}
                />
              </Field>
            </div>
          </div>

          <DataTable>
            <TableHead>
              <th className={thClass}>Member</th>
              <th className={thClass}>Country</th>
              <th className={thClass}>KYC</th>
              <th className={`${thClass} text-right`}>Balance</th>
              <th className={`${thClass} text-right`}>Transactions</th>
              <th className={thClass}>Companies</th>
              <th className={thClass}>Joined</th>
            </TableHead>
            <tbody>
              {loading && teams.length === 0 ? (
                <TableSkeleton columns={7} />
              ) : teams.length === 0 ? (
                <EmptyRow colSpan={7}>No team members found</EmptyRow>
              ) : (
                teams.map((member) => (
                  <tr
                    key={member.id}
                    className="border-b border-line last:border-0 hover:bg-surface-muted"
                  >
                    <td className={tdClass}>
                      <div className="font-medium">{member.fullName}</div>
                      <div className="text-xs text-ink-muted">{member.email}</div>
                    </td>
                    <td className={tdClass}>{member.country || "—"}</td>
                    <td className={tdClass}>
                      <StatusPill status={member.kycStatus} />
                    </td>
                    <td className={`${tdClass} text-right`}>
                      <Money
                        amount={member.walletBalance}
                        currency={member.walletCurrency || undefined}
                      />
                    </td>
                    <td className={`${tdClass} text-right tabular-nums`}>
                      {(
                        member.numberOfTransactions ??
                        member.totalTransactions ??
                        0
                      ).toLocaleString()}
                    </td>
                    <td className={tdClass}>
                      {member.companies?.length
                        ? member.companies.map((company) => (
                            <div key={company.companyId}>
                              {company.companyName}
                              {company.role ? ` · ${company.role}` : ""}
                            </div>
                          ))
                        : "—"}
                    </td>
                    <td className={`${tdClass} whitespace-nowrap text-[#475467]`}>
                      {formatDate(member.signupDate)}
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
