import { DateTabs } from "./DateTabs";
import { DateHeader } from "./DateHeader";
import { CompletedTasksTable } from "./CompletedTasksTable";
import { TablePagination } from "@/components/features/TablePagination";
import type { Task } from "@/lib/types";

interface CompletedViewProps {
  sortedDates: string[];
  selectedDate: string | null;
  grouped: Record<string, Task[]>;
  onDateSelect: (date: string) => void;
  formatDate: (date: string) => string;
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

export function CompletedView({
  sortedDates,
  selectedDate,
  grouped,
  onDateSelect,
  formatDate,
  currentTasks,
  memberMap,
  onEdit,
  onToggle,
  isToggling,
  pagination,
}: CompletedViewProps) {
  if (!selectedDate) return null;

  return (
    <div className="space-y-6">
      <DateTabs
        dates={sortedDates}
        selectedDate={selectedDate}
        taskCounts={Object.fromEntries(
          sortedDates.map(date => [date, grouped[date]?.length || 0])
        )}
        onDateSelect={onDateSelect}
        formatDate={formatDate}
      />

      <DateHeader
        date={selectedDate}
        taskCount={grouped[selectedDate]?.length || 0}
        formatDate={formatDate}
      />

      <CompletedTasksTable
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