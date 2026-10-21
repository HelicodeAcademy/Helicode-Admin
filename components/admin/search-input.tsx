"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { fieldClassName } from "@/components/admin/shell";

export function SearchInput({
  value,
  onChange,
  placeholder = "Search",
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="relative min-w-0 flex-1">
      <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-muted" />
      <Input
        value={value}
        onChange={(event) => onChange(event.target.value.slice(0, 100))}
        placeholder={placeholder}
        className={fieldClassName("pl-9")}
      />
    </div>
  );
}
