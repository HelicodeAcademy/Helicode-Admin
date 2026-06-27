/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useCallback, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  const LIMIT = 10;

  const fetchAdmins = useCallback(
    async (pageNum: number) => {
      try {
        setLoading(true);
        setError("");
        setSuccessMessage("");

        const data = await adminAPI.getAdmins(pageNum, LIMIT);

        setAdmins(data.data);
        // setAdmins(data);
        setTotal(data.data.length);
        // setTotalPages(data.meta.totalPages);
      } finally {
        setLoading(false);
      }
    },
    [LIMIT],
  );

  useEffect(() => {
    fetchAdmins(page);
  }, [fetchAdmins, page]);

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

  if (loading && admins.length === 0) {
    return (
      <div className="p-8">
        <div className="text-center">
          <p className="text-gray-600">Loading admins...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Admin Management
            </h1>
            <p className="mt-2 text-gray-600">Manage platform administrators</p>
          </div>
          <InviteAdminDialog onSuccess={() => fetchAdmins(1)} />
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-800">{successMessage}</p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Admins Table */}
        <Card className="border border-gray-200 bg-white overflow-hidden">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">
              Administrators ({total})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {admins.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600">No admins found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left px-4 py-3 font-semibold text-gray-900">
                        Name
                      </th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-900">
                        Email
                      </th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-900">
                        Role
                      </th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-900">
                        Status
                      </th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-900">
                        Invited
                      </th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-900">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {admins.map((admin) => {
                      const isCurrentUser = currentUser?.id === admin.id;
                      return (
                        <tr
                          key={admin.id}
                          className="border-b border-gray-100 hover:bg-gray-50"
                        >
                          <td className="px-4 py-3 text-gray-900 font-medium">
                            {admin.firstName} {admin.lastName}
                          </td>
                          <td className="px-4 py-3 text-gray-700">
                            {admin.email}
                          </td>
                          <td className="px-4 py-3">
                            <span className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                              {admin.role.replace(/_/g, " ")}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <Badge
                              className={
                                admin.status === "ACTIVE"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-yellow-100 text-yellow-800"
                              }
                            >
                              {admin.status}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-gray-600">
                            {new Date(admin.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex gap-2">
                              {admin.status === "PENDING" && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleResendInvite(admin.id)}
                                  className="border border-gray-300 text-gray-700 hover:bg-gray-50"
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
                                  className="bg-red-600 text-white hover:bg-red-700"
                                >
                                  Remove
                                </Button>
                              )}

                              {isCurrentUser && (
                                <span className="text-xs text-gray-500 italic">
                                  Current User
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pagination */}
        {totalPages > 1 && (
          <PaginationControls
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        )}
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
    </main>
  );
}
