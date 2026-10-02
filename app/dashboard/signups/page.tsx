/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { dashboardAPI, Signup } from "@/lib/api-services";
import { PaginationControls } from "@/components/pagination-controls";
import {
  DataTable,
  EmptyRow,
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

export default function SignupsPage() {
  const [signups, setSignups] = useState<Signup[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterType, setFilterType] = useState<"company" | "team" | "">("");

  const LIMIT = 10;

  useEffect(() => {
    const fetchSignups = async () => {
      try {
        setLoading(true);
        const data = await dashboardAPI.getSignups(page, LIMIT, {
          type: filterType || undefined,
        });
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
  }, [page, filterType]);

  return (
    <Page>
      <PageHeader
        eyebrow="Directory"
        title="Signups"
        description={`${total.toLocaleString()} accounts`}
      />

      <div className="space-y-4">
        {error ? <Notice tone="error">{error}</Notice> : null}

        <Panel>
          <div className="flex items-center justify-between gap-4 border-b border-[#E4E7EC] px-5 py-4">
            <Segmented
              value={filterType}
              onChange={(value) => {
                setFilterType(value);
                setPage(1);
              }}
              options={[
                { label: "All", value: "" },
                { label: "Companies", value: "company" },
                { label: "Teams", value: "team" },
              ]}
            />
          </div>

          <DataTable>
            <TableHead>
              <th className={thClass}>Email</th>
              <th className={thClass}>Type</th>
              <th className={thClass}>Name</th>
              <th className={thClass}>KYC</th>
              <th className={thClass}>Bridge</th>
              <th className={thClass}>Signed up</th>
            </TableHead>
            <tbody>
              {loading && signups.length === 0 ? (
                <TableSkeleton columns={6} />
              ) : signups.length === 0 ? (
                <EmptyRow colSpan={6}>No signups found</EmptyRow>
              ) : (
                signups.map((signup) => (
                  <tr
                    key={signup.id}
                    className="border-b border-[#E4E7EC] last:border-0 hover:bg-[#F9FAFB]"
                  >
                    <td className={`${tdClass} font-medium`}>
                      {signup.employeeEmail}
                    </td>
                    <td className={tdClass}>
                      <StatusPill
                        status="neutral"
                        label={signup.type === "company" ? "Company" : "Team"}
                      />
                    </td>
                    <td className={tdClass}>
                      {signup.companyName || signup.teamName || "—"}
                    </td>
                    <td className={tdClass}>
                      <StatusPill status={signup.kycStatus} />
                    </td>
                    <td className={tdClass}>
                      <StatusPill status={signup.bridgeCustomerStatus} />
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
