"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/auth";

export function UserHeader() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <div className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-600">Logged in as</p>
        <p className="text-lg font-semibold text-gray-900">
          {user?.firstName} {user?.lastName}
        </p>
      </div>

      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="text-sm font-medium text-gray-900">{user?.email}</p>
          <p className="text-xs text-gray-500 capitalize">
            {user?.role.replace(/_/g, " ")}
          </p>
        </div>

        <Button
          onClick={handleLogout}
          variant="outline"
          className="border-gray-300 text-gray-700 hover:bg-gray-50"
        >
          Logout
        </Button>
      </div>
    </div>
  );
}
