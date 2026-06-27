"use client";

import { Button } from "@/components/ui/button";

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function PaginationControls({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationControlsProps) {
  return (
    <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-4">
      <div className="text-sm text-gray-600">
        Page <span className="font-medium">{currentPage}</span> of{" "}
        <span className="font-medium">{totalPages}</span>
      </div>

      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="border border-gray-300 text-gray-700 hover:bg-gray-50"
        >
          Previous
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="border border-gray-300 text-gray-700 hover:bg-gray-50"
        >
          Next
        </Button>
      </div>
    </div>
  );
}
