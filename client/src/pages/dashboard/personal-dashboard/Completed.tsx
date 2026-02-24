import { useMemo, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { AppLayout } from "../../../components/layout/dashboard/AppLayout";
import { TaskFormModal } from "../../../components/features/TaskFormModal";
import { EmptyState } from "../../../components/features/EmptyState";
import { TablePagination } from "../../../components/features/TablePagination";
import { TaskTableRow } from "@/components/features/TaskTableRow";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuth } from "@/lib/auth/AuthContext";
import { useTodos } from "@/lib/api/hooks";
import { mapTodoDtoToTask } from "@/lib/api/mappers";
import { groupByCompletedDate, formatRelativeDate } from "@/lib/utils/tasks";
import { useTaskToggle } from "@/lib/hooks/useTaskToggle";
import { useOrgMemberMap } from "@/lib/hooks/useOrgMemberMap";
import { usePagination } from "@/lib/hooks/usePagination";
import type { Task } from "@/lib/types";

export default function CompletedPage() {
  const { activeOrg } = useAuth();
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const { data, isLoading } = useTodos({
    orgId: activeOrg?.orgId || "",
    page: 1,
    pageSize: 100,
    status: "Done",
    sortBy: "updatedAt",
    ascending: false,
  });

  const memberMap = useOrgMemberMap(activeOrg?.orgId);
  const { toggle, isToggling } = useTaskToggle(activeOrg?.orgId ?? "");

  const tasks = useMemo(() => {
    if (!data?.todos.items || !activeOrg) return [];
    return data.todos.items.map(todo => mapTodoDtoToTask(todo, activeOrg.orgId));
  }, [data, activeOrg]);

  const grouped = groupByCompletedDate(tasks);
  const sortedDates = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

  useState(() => {
    if (sortedDates.length > 0 && !selectedDate) {
      setSelectedDate(sortedDates[0]);
    }
  });

  const currentTasks = selectedDate ? grouped[selectedDate] || [] : [];
  
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
    items: currentTasks,
    pageSize: 5,
  });

  if (!activeOrg) {
    return (
      <AppLayout title="Completed" subtitle="Please select an organisation">
        <EmptyState icon={<CheckCircle2 className="w-6 h-6" style={{ color: "var(--c-texDis)" }} />} title="No organisation selected." />
      </AppLayout>
    );
  }

  return (
    <AppLayout
      title="Completed"
      subtitle={isLoading ? "Loading..." : `${tasks.length} completed task${tasks.length !== 1 ? "s" : ""}`}
    >
      {sortedDates.length === 0 ? (
        <EmptyState icon={<CheckCircle2 className="w-6 h-6" style={{ color: "var(--c-texDis)" }} />} title="No completed tasks yet" description="Complete tasks to see them here" />
      ) : (
        <div className="space-y-6">
          {/* Date selector tabs */}
          <div className="flex flex-wrap gap-2 border-b pb-2" style={{ borderColor: "var(--c-borPri)" }}>
            {sortedDates.map(date => (
              <button
                key={date}
                onClick={() => {
                  setSelectedDate(date);
                  // Reset to first page when changing date
                  goToPage(1); 
                }}
                className={`px-3 py-1.5 text-xs font-medium rounded-t-lg transition-colors ${
                  selectedDate === date 
                    ? 'bg-[var(--c-bluTexAccPri)] text-[var(--c-bacPri)]' 
                    : 'text-[var(--c-texSec)] hover:text-[var(--c-texPri)]'
                }`}
              >
                {formatRelativeDate(date)}
                <span className="ml-1.5 text-xs opacity-70">({grouped[date].length})</span>
              </button>
            ))}
          </div>

          {/* Tasks for selected date */}
          {selectedDate && (
            <>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5" style={{ color: "var(--c-greTexAccPri)" }} />
                <h3 className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--c-texTer)" }}>
                  {formatRelativeDate(selectedDate)}
                </h3>
                <span className="text-xs font-mono px-1.5 py-0.5 rounded-md" style={{ backgroundColor: "var(--c-bacTer)", color: "var(--c-texTer)" }}>
                  {grouped[selectedDate].length}
                </span>
              </div>

              <div className="rounded-xl overflow-hidden" style={{ border: "1px solid var(--c-borPri)", opacity: 0.8 }}>
                <Table>
                  <TableHeader>
                    <TableRow style={{ backgroundColor: "var(--c-bacTer)" }}>
                      <TableHead className="w-10 text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--c-texTer)" }}>S/N</TableHead>
                      <TableHead className="w-8" />
                      <TableHead className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--c-texTer)" }}>Task</TableHead>
                      <TableHead className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--c-texTer)" }}>Priority</TableHead>
                      <TableHead className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--c-texTer)" }}>Due Date</TableHead>
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
                        onEdit={setEditingTask} 
                        onToggle={toggle} 
                        isToggling={isToggling} 
                        showDueDate 
                        showTags={false}
                        serialNumber={startIndex + index} 
                      />
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {currentTasks.length > 0 && (
                <TablePagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={currentTasks.length}
                  startIndex={startIndex}
                  endIndex={endIndex}
                  itemsPerPage={itemsPerPage}
                  onPageChange={goToPage}
                  onItemsPerPageChange={setItemsPerPage}
                />
              )}
            </>
          )}
        </div>
      )}

      {editingTask && <TaskFormModal task={editingTask} onClose={() => setEditingTask(null)} />}
    </AppLayout>
  );
}