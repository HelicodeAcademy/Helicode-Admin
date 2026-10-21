"use client";

import { Button } from "@/components/ui/button";

export function ExportButton({
  loading,
  onClick,
}: {
  loading: boolean;
  onClick: () => void;
}) {
  return (
    <Button
      type="button"
      variant="outline"
      onClick={onClick}
      disabled={loading}
      className="h-10 border-line-strong bg-surface text-ink-secondary hover:bg-surface-muted"
    >
      {loading ? "Exporting..." : "Export CSV"}
    </Button>
  );
}
