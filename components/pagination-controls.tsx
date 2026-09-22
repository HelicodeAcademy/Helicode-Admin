"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

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

  const handleJump = () => {
    goToPage(Number(jumpValue));
  };

  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="flex flex-col gap-3 border-t border-gray-200 bg-white px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="text-sm text-gray-600">
        Page <span className="font-medium">{currentPage}</span> of{" "}
        <span className="font-medium">{totalPages}</span>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => goToPage(currentPage - 1)}
          disabled={currentPage <= 1}
          className="border border-gray-300 text-gray-700 hover:bg-gray-50"
          aria-label="Previous page"
        >
          <ChevronLeft className="size-4" />
          <span className="hidden sm:inline">Previous</span>
        </Button>

        <div className="flex items-center gap-1">
          {pages.map((page, index) =>
            page === "ellipsis" ? (
              <span
                key={`ellipsis-${index}`}
                className="px-2 text-sm text-gray-400"
              >
                …
              </span>
            ) : (
              <Button
                key={page}
                variant="outline"
                size="sm"
                onClick={() => goToPage(page)}
                aria-current={page === currentPage ? "page" : undefined}
                className={cn(
                  "min-w-8 border border-gray-300 px-2",
                  page === currentPage
                    ? "bg-[#363636] text-white hover:bg-gray-700 hover:text-white"
                    : "text-gray-700 hover:bg-gray-50",
                )}
              >
                {page}
              </Button>
            ),
          )}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => goToPage(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="border border-gray-300 text-gray-700 hover:bg-gray-50"
          aria-label="Next page"
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight className="size-4" />
        </Button>

        <div className="ml-1 flex items-center gap-2">
          <span className="text-sm text-gray-600 whitespace-nowrap">Go to</span>
          <Input
            type="number"
            min={1}
            max={totalPages}
            value={jumpValue}
            onChange={(event) => setJumpValue(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                handleJump();
              }
            }}
            className="h-7 w-16 border-gray-300 bg-white"
            aria-label="Go to page"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={handleJump}
            className="border border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            Go
          </Button>
        </div>
      </div>
    </div>
  );
}
