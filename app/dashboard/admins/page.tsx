/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/admin/search-input";
import { useDebounce } from "@/hooks/use-debounce";
import { ADMIN_STATUS_OPTIONS } from "@/lib/list-filter-options";
import {
  DataTable,
  EmptyRow,
  NativeSelect,
  Notice,
  Page,
  PageHeader,
  Panel,
  StatusPill,
  TableHead,
  TableSkeleton,
  formatDate,
  formatLabel,
  tdClass,
  thClass,
} from "@/components/admin/shell";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { adminAPI, Admin } from "@/lib/api-services";
import { InviteAdminDialog } from "@/components/invite-admin-dialog";
import { PaginationControls } from "@/components/pagination-controls";
import { useAuthStore } from "@/store/auth";

export default function AdminsPage() {
  const router = useRouter();
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<{
    open: boolean;
    adminId: string | null;
    adminEmail: string | null;
  }>({
    open: false,
    adminId: null,
    adminEmail: null,
  });
  const [deleting, setDeleting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const currentUser = useAuthStore((state) => state.user);
  const isSuperAdmin = currentUser?.role === "SUPER_ADMIN";
  const LIMIT = 20;
  const [searchInput, setSearchInput] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const search = useDebounce(searchInput.trim());
  const filters = useMemo(
    () => ({
      search: search || undefined,
      status: (statusFilter || undefined) as
        | "PENDING"
        | "ACTIVE"
        | "DISABLED"
        | undefined,
    }),
    [search, statusFilter],
  );

  const fetchAdmins = useCallback(
    async (pageNum: number) => {
      try {
        setLoading(true);
        setError("");
        setSuccessMessage("");

        const data = await adminAPI.getAdmins(pageNum, LIMIT, filters);

        setAdmins(data.data);
        setTotal(data.meta.total);
        setTotalPages(data.meta.totalPages);
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to load admins");
      } finally {
        setLoading(false);
      }
    },
    [LIMIT, filters],
  );

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter]);

  useEffect(() => {
    if (!currentUser) {
      return;
    }

    if (!isSuperAdmin) {
      router.replace("/dashboard");
      return;
    }

    let cancelled = false;

    const loadAdmins = async () => {
      try {
        setLoading(true);
        setError("");
        setSuccessMessage("");

        const data = await adminAPI.getAdmins(page, LIMIT, filters);

        if (cancelled) {
          return;
        }

        setAdmins(data.data);
        setTotal(data.meta.total);
        setTotalPages(data.meta.totalPages);
      } catch (err: any) {
        if (!cancelled) {
          setError(err.response?.data?.message || "Failed to load admins");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void loadAdmins();

    return () => {
      cancelled = true;
    };
  }, [currentUser, isSuperAdmin, page, router, LIMIT, filters]);

  const handleResendInvite = async (adminId: string) => {
    try {
      await adminAPI.resendInvite(adminId);
      setSuccessMessage("Invite resent successfully");
      setTimeout(() => setSuccessMessage(""), 3000);
      console.log("Invite resent");
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to resend invite");
      console.log("Resend error:", err.response?.data);
    }
  };

  const handleDeleteAdmin = async () => {
    if (!deleteConfirm.adminId) return;

    try {
      setDeleting(true);
      await adminAPI.removeAdmin(deleteConfirm.adminId);
      setSuccessMessage("Admin removed successfully");
      setDeleteConfirm({ open: false, adminId: null, adminEmail: null });
      setTimeout(() => setSuccessMessage(""), 3000);
      fetchAdmins(page);
      console.log(" Admin removed");
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to remove admin");
      console.log(" Delete error:", err.response?.data);
    } finally {
      setDeleting(false);
    }
  };

  if (!currentUser || !isSuperAdmin) {
    return (
      <Page>
        <Notice tone="error">
          Access denied. Only the super admin can manage admins.
        </Notice>
      </Page>
    );
  }

  return (
    <Page>
      <PageHeader
        eyebrow="Access"
        title="Admins"
        description={`${total.toLocaleString()} administrators`}
        action={<InviteAdminDialog onSuccess={() => fetchAdmins(1)} />}
      />

      <div className="space-y-4">
        {successMessage ? (
          <Notice tone="success">{successMessage}</Notice>
        ) : null}
        {error ? <Notice tone="error">{error}</Notice> : null}

        <Panel>
          <div className="flex flex-col gap-3 border-b border-line px-5 py-4 md:flex-row">
            <SearchInput
              value={searchInput}
              onChange={(value) => {
                setSearchInput(value);
                setPage(1);
              }}
              placeholder="Search name or email"
            />
            <NativeSelect
              value={statusFilter}
              onChange={(value) => {
                setStatusFilter(value);
                setPage(1);
              }}
              options={[...ADMIN_STATUS_OPTIONS]}
              className="md:w-44"
            />
          </div>
          <DataTable>
            <TableHead>
              <th className={thClass}>Name</th>
              <th className={thClass}>Email</th>
              <th className={thClass}>Role</th>
              <th className={thClass}>Status</th>
              <th className={thClass}>Invited</th>
              <th className={thClass}>Actions</th>
            </TableHead>
            <tbody>
              {loading && admins.length === 0 ? (
                <TableSkeleton columns={6} />
              ) : admins.length === 0 ? (
                <EmptyRow colSpan={6}>No admins found</EmptyRow>
              ) : (
                admins.map((admin) => {
                  const isCurrentUser = currentUser?.id === admin.id;
                  return (
                    <tr
                      key={admin.id}
                      className="border-b border-line last:border-0 hover:bg-surface-muted"
                    >
                      <td className={`${tdClass} font-medium`}>
                        {admin.firstName} {admin.lastName}
                      </td>
                      <td className={tdClass}>{admin.email}</td>
                      <td className={tdClass}>{formatLabel(admin.role)}</td>
                      <td className={tdClass}>
                        <StatusPill status={admin.status} />
                      </td>
                      <td className={`${tdClass} text-[#475467]`}>
                        {formatDate(admin.createdAt)}
                      </td>
                      <td className={tdClass}>
                        <div className="flex gap-2">
                          {admin.status === "PENDING" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleResendInvite(admin.id)}
                              className="h-8 border-line-strong text-ink-secondary hover:bg-surface-muted"
                              disabled={isCurrentUser}
                            >
                              Resend
                            </Button>
                          )}

                          {!isCurrentUser && (
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() =>
                                setDeleteConfirm({
                                  open: true,
                                  adminId: admin.id,
                                  adminEmail: admin.email,
                                })
                              }
                              className="h-8"
                            >
                              Remove
                            </Button>
                          )}

                          {isCurrentUser && (
                            <span className="text-xs text-ink-subtle">You</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={deleteConfirm.open}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteConfirm({ open: false, adminId: null, adminEmail: null });
          }
        }}
      >
        <AlertDialogContent className="border border-line bg-surface">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg font-bold text-ink">
              Remove Admin
            </AlertDialogTitle>
            <AlertDialogDescription className="text-ink-muted">
              Are you sure you want to remove {deleteConfirm.adminEmail}? This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-2 justify-end">
            <AlertDialogCancel className="border border-line-strong text-ink-secondary hover:bg-surface-muted">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAdmin}
              disabled={deleting}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              {deleting ? "Removing..." : "Remove"}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </Page>
  );
}
