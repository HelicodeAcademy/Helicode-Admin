"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/sidebar";
import { UserHeader } from "@/components/user-header";
import { useAuthStore } from "@/store/auth";
import { initializeApiClient } from "@/lib/api-client";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const accessToken = useAuthStore((state) => state.accessToken);
  const isHydrated = useAuthStore((state) => state.isHydrated);

  useEffect(() => {
    // Initialize API client on mount
    initializeApiClient();

    // Redirect to login if not authenticated
    if (isHydrated && (!accessToken || !user)) {
      router.push("/login");
    }
  }, [accessToken, user, router, isHydrated]);

  // Show loading state while hydrating or not authenticated
  if (!isHydrated || !accessToken || !user) {
    return (
      <div className="flex h-screen items-center justify-center bg-white">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <UserHeader />
        <div className="flex-1 overflow-auto">{children}</div>
      </div>
    </div>
  );
}
