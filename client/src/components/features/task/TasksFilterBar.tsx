import { SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FILTER_BTNS, FilterStatus, SORT_OPTIONS, SortBy } from "@/lib/utils/filter";

interface TasksFilterBarProps {
  filterStatus: FilterStatus;
  onFilterChange: (status: FilterStatus) => void;
  sortBy: SortBy;
  onSortChange: (sort: SortBy) => void;
}

export function TasksFilterBar({ filterStatus, onFilterChange, sortBy, onSortChange }: TasksFilterBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-2 mb-5">
      <div className="flex items-center overflow-hidden rounded-lg" style={{ border: "1px solid var(--c-borPri)" }}>
        {FILTER_BTNS.map(({ value, label }) => (
          <Button
            key={value}
            variant="ghost"
            onClick={() => onFilterChange(value)}
            className="px-3 py-1.5 h-auto text-xs font-medium rounded-none"
            style={
              filterStatus === value
                ? { backgroundColor: "var(--c-bluTexAccPri)", color: "var(--c-bacPri)" }
                : { color: "var(--c-texSec)" }
            }
          >
            {label}
          </Button>
        ))}
      </div>
      <div className="flex items-center gap-1.5 ml-auto">
        <SlidersHorizontal className="w-3.5 h-3.5" style={{ color: "var(--c-texTer)" }} />
        <Select value={sortBy} onValueChange={(value: SortBy) => onSortChange(value)}>
          <SelectTrigger className="w-[130px] h-8 text-xs">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent style={{ backgroundColor: "var(--c-bacEle)", borderColor: "var(--c-borPri)" }}>
            {SORT_OPTIONS.map(({ value, label }) => (
              <SelectItem key={value} value={value} className="text-xs">
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}