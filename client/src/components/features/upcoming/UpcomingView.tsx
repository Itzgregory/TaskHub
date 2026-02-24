import { DateDropdown } from "./DateDropdown";
import { DateStats } from "./DateStats";
import { DateHeader } from "./DateHeader";
import { UpcomingTasksTable } from "./UpcomingTasksTable";
import { TablePagination } from "@/components/features/TablePagination";
import type { Task } from "@/lib/types";

interface UpcomingViewProps {
  sortedDates: string[];
  selectedDate: string | null;
  grouped: Record<string, Task[]>;
  onDateSelect: (date: string) => void;
  getDisplayDate: (date: string) => string;
  formatDate: (date: string, format?: string) => string;
  currentTasks: Task[];
  memberMap: Map<string, string>;
  onEdit: (task: Task) => void;
  onToggle: (task: Task) => void;
  isToggling: boolean;
  pagination: {
    currentPage: number;
    totalPages: number;
    itemsPerPage: number;
    totalItems: number;
    startIndex: number;
    endIndex: number;
    onPageChange: (page: number) => void;
    onItemsPerPageChange: (size: number) => void;
  };
}

export function UpcomingView({
  sortedDates,
  selectedDate,
  grouped,
  onDateSelect,
  getDisplayDate,
  formatDate,
  currentTasks,
  memberMap,
  onEdit,
  onToggle,
  isToggling,
  pagination,
}: UpcomingViewProps) {
  if (!selectedDate) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <DateDropdown
          selectedDate={selectedDate}
          dates={sortedDates}
          taskCounts={Object.fromEntries(
            sortedDates.map(date => [date, grouped[date]?.length || 0])
          )}
          onDateSelect={onDateSelect}
          getDisplayDate={getDisplayDate}
        />
        <DateStats totalDates={sortedDates.length} />
      </div>

      <DateHeader
        date={selectedDate}
        taskCount={grouped[selectedDate]?.length || 0}
        formatDate={formatDate}
      />

      <UpcomingTasksTable
        tasks={currentTasks}
        memberMap={memberMap}
        onEdit={onEdit}
        onToggle={onToggle}
        isToggling={isToggling}
        startIndex={pagination.startIndex}
      />

      {currentTasks.length > 0 && (
        <TablePagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          totalItems={pagination.totalItems}
          startIndex={pagination.startIndex}
          endIndex={pagination.endIndex}
          itemsPerPage={pagination.itemsPerPage}
          onPageChange={pagination.onPageChange}
          onItemsPerPageChange={pagination.onItemsPerPageChange}
        />
      )}
    </div>
  );
}