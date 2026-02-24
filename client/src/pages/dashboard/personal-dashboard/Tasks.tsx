import { useMemo, useState } from "react";
import { SlidersHorizontal, Circle } from "lucide-react";
import { AppLayout } from "../../../components/layout/dashboard/AppLayout";
import { AddTaskButton } from "../../../components/features/AddTaskButton";
import { TaskFormModal } from "../../../components/features/TaskFormModal";
import { EmptyState } from "../../../components/features/EmptyState";
import { TablePagination } from "../../../components/features/TablePagination";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth/AuthContext";
import { useTodos } from "@/lib/api/hooks";
import { mapTodoDtoToTask } from "@/lib/api/mappers";
import { PRIORITY_WEIGHT } from "@/lib/utils/tasks";
import { useTaskToggle } from "@/lib/hooks/useTaskToggle";
import { useOrgMemberMap } from "@/lib/hooks/useOrgMemberMap";
import { usePagination } from "@/lib/hooks/usePagination";
import { TaskTableRow } from "@/components/features/TaskTableRow";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Task } from "@/lib/types";
import { FILTER_BTNS, FilterStatus, SORT_OPTIONS, SortBy } from "@/lib/utils/filter";

export default function TasksPage() {
  const { activeOrg } = useAuth();
  const [addingTask, setAddingTask] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const [sortBy, setSortBy] = useState<SortBy>("order");

  const apiStatus = filterStatus === "all" ? undefined : filterStatus === "open" ? "Open" : "Done";

  const { data, isLoading } = useTodos({
    orgId: activeOrg?.orgId || "",
    page: 1,
    pageSize: 100,
    status: apiStatus,
  });

  const memberMap = useOrgMemberMap(activeOrg?.orgId);
  const { toggle, isToggling } = useTaskToggle(activeOrg?.orgId ?? "");

  const allTasks = useMemo(() => {
    if (!data?.todos.items || !activeOrg) return [];
    const mapped = data.todos.items.map(todo => mapTodoDtoToTask(todo, activeOrg.orgId));
    mapped.sort((a, b) => {
      if (sortBy === "priority") return PRIORITY_WEIGHT[a.priority] - PRIORITY_WEIGHT[b.priority];
      if (sortBy === "dueDate") return (a.dueDate ?? "9999").localeCompare(b.dueDate ?? "9999");
      return a.title.localeCompare(b.title);
    });
    return mapped;
  }, [data, activeOrg, sortBy]);

  const {
    currentPage,
    totalPages,
    itemsPerPage,
    setItemsPerPage,
    paginatedItems: tasks,
    goToPage,
    startIndex,
    endIndex,
  } = usePagination({
    items: allTasks,
    pageSize: 5,
  });

  if (!activeOrg) {
    return (
      <AppLayout title="All Tasks" subtitle="Please select an organisation">
        <EmptyState
          icon={<SlidersHorizontal className="w-6 h-6" style={{ color: "var(--c-texDis)" }} />}
          title="No organisation selected. Choose a workspace to view tasks."
        />
      </AppLayout>
    );
  }

  return (
    <AppLayout
      title="All Tasks"
      subtitle={isLoading ? "Loading tasks..." : `${allTasks.length} task${allTasks.length !== 1 ? "s" : ""}`}
    >
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 mb-5">
        <div className="flex items-center overflow-hidden rounded-lg" style={{ border: "1px solid var(--c-borPri)" }}>
          {FILTER_BTNS.map(({ value, label }) => (
            <Button
              key={value}
              variant="ghost"
              onClick={() => setFilterStatus(value)}
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
          <Select value={sortBy} onValueChange={(value: SortBy) => setSortBy(value)}>
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

      {/* Table */}
      <div className="rounded-xl overflow-hidden" style={{ border: "1px solid var(--c-borPri)" }}>
        <Table>
          <TableHeader>
            <TableRow style={{ backgroundColor: "var(--c-bacTer)" }}>
              <TableHead className="w-10 text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--c-texTer)" }}>S/N</TableHead>
              <TableHead className="w-8" />
              <TableHead className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--c-texTer)" }}>Task</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--c-texTer)" }}>Priority</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--c-texTer)" }}>Due Date</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--c-texTer)" }}>Assignee</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--c-texTer)" }}>Tags</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-right" style={{ color: "var(--c-texTer)" }}>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-10 text-sm" style={{ color: "var(--c-texDis)" }}>Loading tasks…</TableCell>
              </TableRow>
            ) : tasks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8}>
                  <EmptyState icon={<Circle className="w-6 h-6" style={{ color: "var(--c-texDis)" }} />} title="No tasks match your filters" />
                </TableCell>
              </TableRow>
            ) : tasks.map((task, index) => (
              <TaskTableRow
                key={task.id}
                task={task}
                memberMap={memberMap}
                onEdit={setEditingTask}
                onToggle={toggle}
                isToggling={isToggling}
                showDueDate
                showTags
                serialNumber={startIndex + index}
              />
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {!isLoading && allTasks.length > 0 && (
        <TablePagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={allTasks.length}
          startIndex={startIndex}
          endIndex={endIndex}
          itemsPerPage={itemsPerPage}
          onPageChange={goToPage}
          onItemsPerPageChange={setItemsPerPage}
        />
      )}

      <AddTaskButton onClick={() => setAddingTask(true)} />
      {addingTask && <TaskFormModal onClose={() => setAddingTask(false)} />}
      {editingTask && <TaskFormModal task={editingTask} onClose={() => setEditingTask(null)} />}
    </AppLayout>
  );
}