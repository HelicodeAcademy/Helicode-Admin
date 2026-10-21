"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { fieldClassName } from "@/components/admin/shell";

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

function getPageNumbers(currentPage: number, totalPages: number) {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const pages: Array<number | "ellipsis"> = [1];

  if (currentPage > 3) {
    pages.push("ellipsis");
  }

  const start = Math.max(2, currentPage - 1);
  const end = Math.min(totalPages - 1, currentPage + 1);

  for (let page = start; page <= end; page += 1) {
    pages.push(page);
  }

  if (currentPage < totalPages - 2) {
    pages.push("ellipsis");
  }

  pages.push(totalPages);
  return pages;
}

export function PaginationControls({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationControlsProps) {
  const [jumpValue, setJumpValue] = useState(String(currentPage));
  const pages = getPageNumbers(currentPage, totalPages);

  useEffect(() => {
    setJumpValue(String(currentPage));
  }, [currentPage]);

  const goToPage = (page: number) => {
    if (!Number.isFinite(page)) return;
    const nextPage = Math.min(Math.max(Math.trunc(page), 1), totalPages);
    if (nextPage !== currentPage) {
      onPageChange(nextPage);
    }
  };

  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="flex flex-col gap-3 border-t border-line px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm font-medium text-ink-secondary">
        Page {currentPage} of {totalPages}
      </p>

      <div className="flex flex-wrap items-center gap-1.5">
        <Button
          variant="outline"
          size="sm"
          onClick={() => goToPage(currentPage - 1)}
          disabled={currentPage <= 1}
          className="h-8 border-line-strong bg-surface text-ink-secondary hover:bg-surface-muted"
        >
          Previous
        </Button>

        {pages.map((page, index) =>
          page === "ellipsis" ? (
            <span
              key={`ellipsis-${index}`}
              className="px-1 text-sm text-ink-subtle"
            >
              …
            </span>
          ) : (
            <button
              key={page}
              type="button"
              onClick={() => goToPage(page)}
              aria-current={page === currentPage ? "page" : undefined}
              className={cn(
                "h-8 min-w-8 rounded-md px-2 text-sm font-medium",
                page === currentPage
                  ? "bg-ink text-canvas"
                  : "text-ink-secondary hover:bg-surface-muted",
              )}
            >
              {page}
            </button>
          ),
        )}

        <Button
          variant="outline"
          size="sm"
          onClick={() => goToPage(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="h-8 border-line-strong bg-surface text-ink-secondary hover:bg-surface-muted"
        >
          Next
        </Button>

        <form
          className="ml-2 flex items-center gap-1.5"
          onSubmit={(event) => {
            event.preventDefault();
            goToPage(Number(jumpValue));
          }}
        >
          <Input
            type="number"
            min={1}
            max={totalPages}
            value={jumpValue}
            onChange={(event) => setJumpValue(event.target.value)}
            className={fieldClassName("h-8 w-14")}
            aria-label="Go to page"
          />
        </form>
      </div>
    </div>
  );
}
