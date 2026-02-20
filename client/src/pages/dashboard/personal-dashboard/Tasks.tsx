import { useMemo, useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import { AppLayout } from "../../../components/layout/dashboard/AppLayout";
import { TaskList } from "../../../components/features/TaskList";
import { AddTaskButton } from "../../../components/features/AddTaskButton";
import { TaskFormModal } from "../../../components/features/TaskFormModal";
import { EmptyState } from "../../../components/features/EmptyState";
import { useAuth } from "@/lib/auth/AuthContext";
import { useTodos } from "@/lib/api/hooks";
import { mapTodoDtoToTask } from "@/lib/api/mappers";
import { PRIORITY_WEIGHT } from "@/lib/utils/tasks";
import { Button } from "@/components/ui/button";
import type { Priority } from "../../../lib/types";

type FilterStatus = "all" | "todo" | "in_progress" | "done";
type SortBy = "order" | "dueDate" | "priority";

const FILTER_BTNS: { value: FilterStatus; label: string }[] = [
  { value: "all", label: "All" },
  { value: "todo", label: "Todo" },
  { value: "in_progress", label: "In Progress" },
  { value: "done", label: "Done" },
];

export default function TasksPage() {
  const { activeOrg } = useAuth();
  const [addingTask, setAddingTask] = useState(false);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const [sortBy, setSortBy] = useState<SortBy>("order");

  const { data, isLoading } = useTodos({
    orgId: activeOrg?.orgId || "",
    page: 1,
    pageSize: 100,
  });

  const tasks = useMemo(() => {
    if (!data?.todos.items || !activeOrg) return [];
    let mapped = data.todos.items.map((todo) => mapTodoDtoToTask(todo, activeOrg.orgId));

    if (filterStatus !== "all") {
      mapped = mapped.filter((t) => t.status === filterStatus);
    }

    mapped.sort((a, b) => {
      if (sortBy === "priority") return PRIORITY_WEIGHT[a.priority] - PRIORITY_WEIGHT[b.priority];
      if (sortBy === "dueDate") return (a.dueDate ?? "9999").localeCompare(b.dueDate ?? "9999");
      return a.title.localeCompare(b.title);
    });

    return mapped;
  }, [data, activeOrg, filterStatus, sortBy]);

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
      subtitle={isLoading ? "Loading tasks..." : `${tasks.length} task${tasks.length !== 1 ? "s" : ""}`}
    >
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 mb-5">
        {/* Status filter tabs */}
        <div
          className="flex items-center overflow-hidden text-xs rounded-lg"
          style={{ border: "1px solid var(--c-borPri)" }}
        >
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

        {/* Sort */}
        <div className="flex items-center gap-1.5 ml-auto">
          <SlidersHorizontal className="w-3.5 h-3.5" style={{ color: "var(--c-texTer)" }} />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortBy)}
            className="th-select"
          >
            <option value="order">Default</option>
            <option value="dueDate">Due Date</option>
            <option value="priority">Priority</option>
          </select>
        </div>
      </div>

      <TaskList tasks={tasks} showProject emptyMessage="No tasks match your filters" />

      <AddTaskButton onClick={() => setAddingTask(true)} />

      {addingTask && <TaskFormModal onClose={() => setAddingTask(false)} />}
    </AppLayout>
  );
}
