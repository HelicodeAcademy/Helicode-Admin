/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DataTable,
  EmptyRow,
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
  const LIMIT = 10;

  const fetchAdmins = useCallback(
    async (pageNum: number) => {
      try {
        setLoading(true);
        setError("");
        setSuccessMessage("");

        const data = await adminAPI.getAdmins(pageNum, LIMIT);

        setAdmins(data.data);
        setTotal(data.meta.total);
        setTotalPages(data.meta.totalPages);
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to load admins");
      } finally {
        setLoading(false);
      }
    },
    [LIMIT],
  );

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

        const data = await adminAPI.getAdmins(page, LIMIT);

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
  }, [currentUser, isSuperAdmin, page, router, LIMIT]);

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
                      className="border-b border-[#E4E7EC] last:border-0 hover:bg-[#F9FAFB]"
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
                              className="h-8 border-[#D0D5DD] text-[#344054] hover:bg-[#F9FAFB]"
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
                            <span className="text-xs text-[#98A2B3]">You</span>
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
        <AlertDialogContent className="border border-gray-200">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg font-bold text-gray-900">
              Remove Admin
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600">
              Are you sure you want to remove {deleteConfirm.adminEmail}? This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-2 justify-end">
            <AlertDialogCancel className="border border-gray-300 text-gray-700 hover:bg-gray-50">
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
