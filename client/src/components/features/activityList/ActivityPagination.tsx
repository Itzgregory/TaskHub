import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ActivityPaginationProps {
  page: number;
  totalPages: number;
  totalCount: number;
  onPageChange: (page: number) => void;
}

export function ActivityPagination({ page, totalPages, totalCount, onPageChange }: ActivityPaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div
      className="flex items-center justify-between px-3 py-3 rounded-lg mt-4"
      style={{ backgroundColor: "var(--c-bacSec)", border: "1px solid var(--c-borPri)" }}
    >
      <span className="text-xs" style={{ color: "var(--c-texTer)" }}>
        Page {page} of {totalPages} ({totalCount} total events)
      </span>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className="h-7 px-2"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          <span className="text-xs ml-1">Previous</span>
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          className="h-7 px-2"
        >
          <span className="text-xs mr-1">Next</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
}