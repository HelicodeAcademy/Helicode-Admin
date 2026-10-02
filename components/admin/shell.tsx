import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Page({ children }: { children: ReactNode }) {
  return <main className="px-8 py-6">{children}</main>;
}

export function PageHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <header className="mb-5 flex items-end justify-between gap-4">
      <div>
        {eyebrow ? (
          <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-[#98A2B3]">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="mt-1 text-xl font-semibold tracking-tight text-[#0F112A]">
          {title}
        </h1>
        {description ? (
          <p className="mt-1 text-sm text-[#667085]">{description}</p>
        ) : null}
      </div>
      {action}
    </header>
  );
}

export function Panel({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "rounded-lg border border-[#E4E7EC] bg-white",
        className,
      )}
    >
      {children}
    </section>
  );
}

export function Metric({
  label,
  value,
  detail,
}: {
  label: string;
  value: ReactNode;
  detail?: string;
}) {
  return (
    <div className="min-w-0 px-5 py-4 first:pl-0 last:pr-0">
      <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-[#667085]">
        {label}
      </p>
      <p className="mt-2 text-[1.75rem] font-semibold leading-none tracking-tight text-[#050505] tabular-nums">
        {value}
      </p>
      {detail ? <p className="mt-2 text-sm text-[#667085]">{detail}</p> : null}
    </div>
  );
}

export function Money({
  amount,
  currency,
}: {
  amount: string | number | null | undefined;
  currency?: string;
}) {
  if (amount === null || amount === undefined || amount === "") {
    return <span className="text-[#98A2B3]">—</span>;
  }

  const value = typeof amount === "string" ? Number(amount) : amount;
  if (!Number.isFinite(value)) {
    return <span>{String(amount)}</span>;
  }

  const [whole, fraction] = value
    .toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
    .split(".");

  const unit = currency?.toUpperCase();
  const dollar = unit === "USD" || unit === "USDC" || !unit;

  return (
    <span className="tabular-nums font-medium text-[#101928]">
      {dollar ? "$" : ""}
      {whole}
      <span className="text-[#C5C5C5]">.{fraction}</span>
      {!dollar && unit ? (
        <span className="ml-1 text-xs font-medium text-[#667085]">{unit}</span>
      ) : null}
    </span>
  );
}

type StatusTone = "positive" | "warning" | "negative" | "neutral";

function statusTone(status: string | null | undefined): StatusTone {
  const value = (status || "").toUpperCase();
  if (
    [
      "SUCCESS",
      "SUCCESSFUL",
      "COLLECTED",
      "COMPLETED",
      "APPROVED",
      "CONNECTED",
      "ACTIVE",
      "PAID",
    ].includes(value)
  ) {
    return "positive";
  }
  if (
    [
      "PENDING",
      "PROCESSING",
      "INITIATED",
      "CRYPTO_SENT",
      "YC_PAYMENT_CREATED",
    ].includes(value)
  ) {
    return "warning";
  }
  if (
    [
      "FAILED",
      "REJECTED",
      "CANCELLED",
      "REFUNDED",
      "PENDING_REFUND",
      "REFUND_FAILED",
    ].includes(value)
  ) {
    return "negative";
  }
  return "neutral";
}

const toneClass: Record<StatusTone, string> = {
  positive: "border-[#CAEFDC] bg-[#ECFDF3] text-[#4D8F72]",
  warning: "border-[#E5D7CB] bg-[#FFEFE2] text-[#EE7D1F]",
  negative: "border-[#F0D0D0] bg-[#FDECEC] text-[#D32828]",
  neutral: "border-[#E4E7EC] bg-[#F9FAFB] text-[#344054]",
};

export function StatusPill({
  status,
  label,
}: {
  status: string | null | undefined;
  label?: string;
}) {
  const text = label ?? (status ? formatLabel(status) : "—");
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold",
        toneClass[statusTone(status)],
      )}
    >
      {text}
    </span>
  );
}

export function Segmented<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: Array<{ label: string; value: T }>;
  onChange: (value: T) => void;
}) {
  return (
    <div className="inline-flex w-fit rounded-lg border border-[#E4E7EC] bg-[#F1F2F3] p-1">
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value || option.label}
            type="button"
            onClick={() => onChange(option.value)}
            className={cn(
              "rounded-md px-3.5 py-1.5 text-sm transition-colors",
              active
                ? "bg-white font-semibold text-[#0F112A] shadow-sm"
                : "font-medium text-[#475467] hover:text-[#0F112A]",
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

export function fieldClassName(extra?: string) {
  return cn(
    "h-10 rounded-md border-[#E4E7EC] bg-white px-3 text-sm text-[#0F112A] placeholder:text-[#98A2B3]",
    extra,
  );
}

export function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="flex min-w-0 flex-col gap-1.5">
      <span className="text-xs font-medium text-[#667085]">{label}</span>
      {children}
    </label>
  );
}

export const thClass =
  "px-5 py-3 text-left text-[11px] font-medium uppercase tracking-[0.06em] text-[#667085]";

export const tdClass = "px-5 py-4 text-sm text-[#101928]";

export function DataTable({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">{children}</table>
    </div>
  );
}

export function TableHead({ children }: { children: ReactNode }) {
  return (
    <thead>
      <tr className="border-b border-[#E4E7EC] bg-[#F9FAFB]">{children}</tr>
    </thead>
  );
}

export function EmptyRow({
  colSpan,
  children,
}: {
  colSpan: number;
  children: ReactNode;
}) {
  return (
    <tr>
      <td
        colSpan={colSpan}
        className="px-5 py-12 text-center text-sm text-[#667085]"
      >
        {children}
      </td>
    </tr>
  );
}

export function Notice({
  tone,
  children,
}: {
  tone: "error" | "success";
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "rounded-md border px-3.5 py-2.5 text-sm",
        tone === "error"
          ? "border-[#F0D0D0] bg-[#FDECEC] text-[#912018]"
          : "border-[#CAEFDC] bg-[#ECFDF3] text-[#05603A]",
      )}
    >
      {children}
    </div>
  );
}

export function TableSkeleton({
  columns,
  rows = 6,
}: {
  columns: number;
  rows?: number;
}) {
  return (
    <>
      {Array.from({ length: rows }).map((_, row) => (
        <tr key={row} className="border-b border-[#E4E7EC]">
          {Array.from({ length: columns }).map((__, cell) => (
            <td key={cell} className="px-5 py-4">
              <div className="h-3.5 w-3/4 animate-pulse rounded bg-[#F2F4F7]" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

export function formatLabel(value: string) {
  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

export function formatDate(value: string | null | undefined) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}
