export const KYC_STATUS_OPTIONS = [
  { label: "All KYC", value: "" },
  { label: "Approved", value: "approved" },
  { label: "Under review", value: "under_review" },
  { label: "Rejected", value: "rejected" },
  { label: "Awaiting UBO", value: "awaiting_ubo" },
  { label: "Not started", value: "not_started" },
  { label: "Incomplete", value: "incomplete" },
] as const;

export const TOS_STATUS_OPTIONS = [
  { label: "All terms", value: "" },
  { label: "Pending", value: "pending" },
  { label: "Approved", value: "approved" },
] as const;

export const ADMIN_STATUS_OPTIONS = [
  { label: "All statuses", value: "" },
  { label: "Active", value: "ACTIVE" },
  { label: "Pending", value: "PENDING" },
  { label: "Disabled", value: "DISABLED" },
] as const;

export const SORT_OPTIONS = [
  { label: "Newest", value: "createdAt:desc" },
  { label: "Oldest", value: "createdAt:asc" },
  { label: "Name A–Z", value: "name:asc" },
  { label: "Name Z–A", value: "name:desc" },
] as const;

export function parseSort(value: string) {
  const [sort, order] = value.split(":");
  return {
    sort: (sort === "name" ? "name" : "createdAt") as "createdAt" | "name",
    order: (order === "asc" ? "asc" : "desc") as "asc" | "desc",
  };
}
