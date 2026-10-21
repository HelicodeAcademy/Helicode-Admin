"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PayrollRevenuePanel } from "@/components/revenue/payroll-revenue-panel";
import { OfframpRevenuePanel } from "@/components/revenue/offramp-revenue-panel";
import { RevenueSummary } from "@/components/revenue/revenue-summary";
import { Page, PageHeader, Segmented } from "@/components/admin/shell";

type RevenueTab = "payroll" | "offramp";

function RevenuePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab: RevenueTab =
    searchParams.get("tab") === "offramp" ? "offramp" : "payroll";

  const handleTabChange = (tab: RevenueTab) => {
    const params = new URLSearchParams(searchParams.toString());
    if (tab === "payroll") {
      params.delete("tab");
    } else {
      params.set("tab", tab);
    }
    const query = params.toString();
    router.replace(query ? `/dashboard/revenue?${query}` : "/dashboard/revenue");
  };

  return (
    <Page>
      <PageHeader
        eyebrow="Finance"
        title="Revenue"
        description="Collected developer fees from payroll transfers and cash-outs."
      />

      <RevenueSummary />

      <div className="mb-4">
        <Segmented
          value={activeTab}
          onChange={handleTabChange}
          options={[
            { label: "Payroll", value: "payroll" },
            { label: "Offramp", value: "offramp" },
          ]}
        />
      </div>

      {activeTab === "payroll" ? (
        <PayrollRevenuePanel />
      ) : (
        <OfframpRevenuePanel />
      )}
    </Page>
  );
}

export default function RevenuePage() {
  return (
    <Suspense
      fallback={
        <Page>
          <p className="text-sm text-ink-muted">Loading revenue...</p>
        </Page>
      }
    >
      <RevenuePageContent />
    </Suspense>
  );
}
