"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  UserPlus,
  Users,
  CircleDollarSign,
  Settings,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth";

const groups: Array<{
  label: string;
  items: Array<{ name: string; href: string; icon: LucideIcon }>;
}> = [
  {
    label: "Overview",
    items: [{ name: "Dashboard", href: "/dashboard", icon: LayoutDashboard }],
  },
  {
    label: "Finance",
    items: [
      { name: "Revenue", href: "/dashboard/revenue", icon: CircleDollarSign },
    ],
  },
  {
    label: "Directory",
    items: [
      { name: "Signups", href: "/dashboard/signups", icon: UserPlus },
      { name: "Teams", href: "/dashboard/teams", icon: Users },
    ],
  },
  {
    label: "Access",
    items: [{ name: "Admins", href: "/dashboard/admins", icon: Settings }],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const currentUser = useAuthStore((state) => state.user);
  const isSuperAdmin = currentUser?.role === "SUPER_ADMIN";

  return (
    <aside className="flex h-screen w-60 shrink-0 flex-col border-r border-line bg-surface">
      <div className="px-5 py-5">
        <p className="text-[15px] font-semibold tracking-tight text-ink">
          Helicode
        </p>
        <p className="mt-0.5 text-xs text-ink-subtle">Admin</p>
      </div>

      <nav className="flex-1 space-y-5 px-3 pb-6">
        {groups.map((group) => {
          const items = group.items.filter(
            (item) => isSuperAdmin || item.href !== "/dashboard/admins",
          );
          if (items.length === 0) return null;

          return (
            <div key={group.label}>
              <p className="px-3 pb-1.5 text-[11px] font-medium uppercase tracking-[0.08em] text-ink-subtle">
                {group.label}
              </p>
              <div className="space-y-0.5">
                {items.map((item) => {
                  const isActive =
                    item.href === "/dashboard"
                      ? pathname === "/dashboard"
                      : pathname.startsWith(item.href) ||
                        (item.href === "/dashboard/revenue" &&
                          (pathname.startsWith("/dashboard/payroll-revenue") ||
                            pathname.startsWith("/dashboard/offramp-revenue")));
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex h-9 items-center gap-2.5 rounded-md px-3 text-sm font-medium transition-colors",
                        isActive
                          ? "bg-brand/10 text-brand"
                          : "text-ink-muted hover:bg-surface-muted hover:text-ink",
                      )}
                    >
                      <Icon className="size-4 shrink-0" strokeWidth={1.75} />
                      {item.name}
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
