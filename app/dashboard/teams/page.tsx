/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { dashboardAPI, TeamMember } from "@/lib/api-services";
import { PaginationControls } from "@/components/pagination-controls";
import {
  DataTable,
  EmptyRow,
  Money,
  Notice,
  Page,
  PageHeader,
  Panel,
  TableHead,
  TableSkeleton,
  formatDate,
  tdClass,
  thClass,
} from "@/components/admin/shell";

export default function TeamsPage() {
  const [teams, setTeams] = useState<TeamMember[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const LIMIT = 10;

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        setLoading(true);
        const data = await dashboardAPI.getTeams(page, LIMIT);
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
  }, [page]);

  return (
    <Page>
      <PageHeader
        eyebrow="Directory"
        title="Teams"
        description={`${total.toLocaleString()} team members`}
      />

      <div className="space-y-4">
        {error ? <Notice tone="error">{error}</Notice> : null}

        <Panel>
          <DataTable>
            <TableHead>
              <th className={thClass}>Member</th>
              <th className={thClass}>Role</th>
              <th className={`${thClass} text-right`}>Balance</th>
              <th className={`${thClass} text-right`}>Transactions</th>
              <th className={thClass}>Companies</th>
              <th className={thClass}>Joined</th>
            </TableHead>
            <tbody>
              {loading && teams.length === 0 ? (
                <TableSkeleton columns={6} />
              ) : teams.length === 0 ? (
                <EmptyRow colSpan={6}>No team members found</EmptyRow>
              ) : (
                teams.map((member) => (
                  <tr
                    key={member.id}
                    className="border-b border-[#E4E7EC] last:border-0 hover:bg-[#F9FAFB]"
                  >
                    <td className={tdClass}>
                      <div className="font-medium">{member.fullName}</div>
                      <div className="text-xs text-[#667085]">{member.email}</div>
                    </td>
                    <td className={tdClass}>
                      {member.companies?.length
                        ? member.companies.map((company) => (
                            <div key={company.companyId}>{company.role}</div>
                          ))
                        : "—"}
                    </td>
                    <td className={`${tdClass} text-right`}>
                      <Money amount={member.walletBalance} />
                    </td>
                    <td className={`${tdClass} text-right tabular-nums`}>
                      {(member.totalTransactions ?? 0).toLocaleString()}
                    </td>
                    <td className={tdClass}>
                      {member.companies?.length
                        ? member.companies.map((company) => (
                            <div key={company.companyId}>
                              {company.companyName}
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
