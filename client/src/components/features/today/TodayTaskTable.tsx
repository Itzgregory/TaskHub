import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TablePagination } from "@/components/features/TablePagination";
import { TaskTableRow } from "@/components/features/TaskTableRow";
import { usePagination } from "@/lib/hooks/usePagination";
import type { Task } from "@/lib/types";

interface TodayTaskTableProps {
  rows: Task[];
  memberMap: Map<string, string>;
  onEdit: (task: Task) => void;
  onToggle: (task: Task) => void;
  isToggling: boolean;
  faded?: boolean;
  title?: string;
}

export function TodayTaskTable({ 
  rows, 
  memberMap, 
  onEdit, 
  onToggle, 
  isToggling, 
  faded,
  title 
}: TodayTaskTableProps) {
  const {
    currentPage,
    totalPages,
    itemsPerPage,
    setItemsPerPage,
    paginatedItems,
    goToPage,
    startIndex,
    endIndex,
  } = usePagination({
    items: rows,
    pageSize: 5,
  });

  if (rows.length === 0) return null;

  return (
    <div>
      {title && (
        <h3 className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--c-texTer)" }}>
          {title} ({rows.length})
        </h3>
      )}
      <div className="rounded-xl overflow-hidden" style={{ border: "1px solid var(--c-borPri)", opacity: faded ? 0.6 : 1 }}>
        <Table>
          <TableHeader>
            <TableRow style={{ backgroundColor: "var(--c-bacTer)" }}>
              <TableHead className="w-10 text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--c-texTer)" }}>#</TableHead>
              <TableHead className="w-8" />
              <TableHead className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--c-texTer)" }}>Task</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--c-texTer)" }}>Priority</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--c-texTer)" }}>Assignee</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-right" style={{ color: "var(--c-texTer)" }}>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedItems.map((task, index) => (
              <TaskTableRow 
                key={task.id} 
                task={task} 
                memberMap={memberMap} 
                onEdit={onEdit} 
                onToggle={onToggle} 
                isToggling={isToggling} 
                showDueDate={false} 
                showTags={false}
                serialNumber={startIndex + index} 
              />
            ))}
          </TableBody>
        </Table>
      </div>
      
      {rows.length > 0 && (
        <TablePagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={rows.length}
          startIndex={startIndex}
          endIndex={endIndex}
          itemsPerPage={itemsPerPage}
          onPageChange={goToPage}
          onItemsPerPageChange={setItemsPerPage}
        />
      )}
    </div>
  );
}