"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
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
    <header className="flex h-14 items-center justify-between border-b border-line bg-surface px-8">
      <p className="text-sm text-ink-muted">
        {user?.firstName} {user?.lastName}
        <span className="mx-2 text-line-strong">·</span>
        <span className="capitalize">
          {user?.role.replace(/_/g, " ").toLowerCase()}
        </span>
      </p>

      <div className="flex items-center gap-3">
        <ThemeToggle />
        <div className="text-right">
          <p className="text-sm font-medium text-ink">{user?.email}</p>
        </div>
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-muted text-xs font-semibold text-ink-secondary">
          {initials}
        </div>
        <Button
          onClick={handleLogout}
          variant="outline"
          size="sm"
          className="h-8 border-line-strong bg-surface text-ink-secondary hover:bg-surface-muted"
        >
          Log out
        </Button>
      </div>
    </header>
  );
}
