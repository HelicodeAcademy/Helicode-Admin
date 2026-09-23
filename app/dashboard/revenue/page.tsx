"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { PayrollRevenuePanel } from "@/components/revenue/payroll-revenue-panel";
import { OfframpRevenuePanel } from "@/components/revenue/offramp-revenue-panel";

type RevenueTab = "payroll" | "offramp";

const TABS: Array<{ id: RevenueTab; label: string; description: string }> = [
  {
    id: "payroll",
    label: "Payroll",
    description: "Developer fee from company payroll transfers",
  },
  {
    id: "offramp",
    label: "Offramp",
    description: "Developer fee from team and company cash-outs",
  },
];

function RevenuePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab: RevenueTab =
    searchParams.get("tab") === "offramp" ? "offramp" : "payroll";
  const activeMeta = TABS.find((tab) => tab.id === activeTab) ?? TABS[0];

  const handleTabChange = (tab: RevenueTab) => {
    const params = new URLSearchParams(searchParams.toString());
    if (tab === "payroll") {
      params.delete("tab");
    } else {
      params.set("tab", tab);
    }
    const query = params.toString();
    router.replace(
      query ? `/dashboard/revenue?${query}` : "/dashboard/revenue",
    );
  };

  return (
    <main className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Revenue</h1>
          <p className="mt-2 text-gray-600">{activeMeta.description}</p>
        </div>

        <div className="mb-6 flex gap-2 border-b border-gray-200">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={cn(
                "px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px",
                activeTab === tab.id
                  ? "border-[#363636] text-gray-900"
                  : "border-transparent text-gray-500 hover:text-gray-800",
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "payroll" ? (
          <PayrollRevenuePanel />
        ) : (
          <OfframpRevenuePanel />
        )}
      </div>
    </main>
  );
}

export default function RevenuePage() {
  return (
    <Suspense
      fallback={
        <div className="p-8">
          <p className="text-gray-600">Loading revenue...</p>
        </div>
      }
    >
      <RevenuePageContent />
    </Suspense>
  );
}
