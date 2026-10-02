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

  const initials = `${user?.firstName?.[0] ?? ""}${user?.lastName?.[0] ?? ""}`;

  return (
    <header className="flex h-14 items-center justify-between border-b border-[#E4E7EC] bg-white px-8">
      <p className="text-sm text-[#667085]">
        {user?.firstName} {user?.lastName}
        <span className="mx-2 text-[#D0D5DD]">·</span>
        <span className="capitalize">
          {user?.role.replace(/_/g, " ").toLowerCase()}
        </span>
      </p>

      <div className="flex items-center gap-3">
        <div className="text-right">
          <p className="text-sm font-medium text-[#101928]">{user?.email}</p>
        </div>
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F2F4F7] text-xs font-semibold text-[#344054]">
          {initials}
        </div>
        <Button
          onClick={handleLogout}
          variant="outline"
          size="sm"
          className="h-8 border-[#D0D5DD] bg-white text-[#344054] hover:bg-[#F9FAFB]"
        >
          Log out
        </Button>
      </div>
    </header>
  );
}
