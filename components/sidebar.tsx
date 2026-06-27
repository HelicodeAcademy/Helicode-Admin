"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: "📊" },
  { name: "Signups", href: "/dashboard/signups", icon: "📝" },
  { name: "Teams", href: "/dashboard/teams", icon: "👥" },
  { name: "Admins", href: "/dashboard/admins", icon: "⚙️" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-screen flex flex-col">
      {/* Logo/Brand */}
      <div className="px-6 py-6 border-b border-gray-200">
        <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navigation.map((item) => {
          // Check if current path matches this nav item
          const isActive =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-[#363636] text-white"
                  : "text-gray-700 hover:bg-gray-100",
              )}
            >
              <span className="text-lg">{item.icon}</span>
              {item.name}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
