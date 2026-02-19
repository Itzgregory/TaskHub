import { useState } from "react";
import { Plus, SlidersHorizontal } from "lucide-react";
import { AppLayout } from "../../components/layout/dashboard/AppLayout";
import { TaskList } from "../../components/features/TaskList";
import { TaskFormModal } from "../../components/features/TaskFormModal";
import { useStore } from "../../lib/store";
import type { Priority } from "../../lib/types";

type FilterStatus = "all" | "todo" | "in_progress" | "done";
type SortBy = "order" | "dueDate" | "priority";

const PRIORITY_WEIGHT: Record<Priority, number> = {
  urgent: 0, high: 1, medium: 2, low: 3, none: 4,
};

export default function TasksPage() {
  const { state } = useStore();
  const [addingTask, setAddingTask] = useState(false);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const [filterProject, setFilterProject] = useState<string>("all");
  const [sortBy, setSortBy] = useState<SortBy>("order");

  let tasks = [...state.tasks];
  if (filterStatus !== "all") tasks = tasks.filter(t => t.status === filterStatus);
  if (filterProject !== "all") tasks = tasks.filter(t => t.projectId === filterProject);
  tasks.sort((a, b) => {
    if (sortBy === "priority") return PRIORITY_WEIGHT[a.priority] - PRIORITY_WEIGHT[b.priority];
    if (sortBy === "dueDate") return (a.dueDate ?? "9999").localeCompare(b.dueDate ?? "9999");
    return a.order - b.order;
  });

  const FILTER_BTNS: { value: FilterStatus; label: string }[] = [
    { value: "all", label: "All" },
    { value: "todo", label: "Todo" },
    { value: "in_progress", label: "In Progress" },
    { value: "done", label: "Done" },
  ];

  return (
    <AppLayout title="All Tasks" subtitle={`${tasks.length} task${tasks.length !== 1 ? "s" : ""}`}>
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 mb-5">
        {/* Status filter tabs */}
        <div
          className="flex items-center overflow-hidden text-xs rounded-lg"
          style={{ border: "1px solid var(--c-borPri)" }}
        >
          {FILTER_BTNS.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setFilterStatus(value)}
              className="px-3 py-1.5 font-medium transition-colors"
              style={filterStatus === value
                ? { backgroundColor: "var(--c-bluTexAccPri)", color: "var(--c-bacPri)" }
                : { color: "var(--c-texSec)" }
              }
              onMouseOver={e => {
                if (filterStatus !== value) e.currentTarget.style.backgroundColor = "var(--c-bacTer)";
              }}
              onMouseOut={e => {
                if (filterStatus !== value) e.currentTarget.style.backgroundColor = "";
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Project filter */}
        <select
          value={filterProject}
          onChange={e => setFilterProject(e.target.value)}
          className="th-select"
        >
          <option value="all">All Projects</option>
          {state.projects.map(p => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>

        {/* Sort */}
        <div className="flex items-center gap-1.5 ml-auto">
          <SlidersHorizontal className="w-3.5 h-3.5" style={{ color: "var(--c-texTer)" }} />
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as SortBy)}
            className="th-select"
          >
            <option value="order">Default</option>
            <option value="dueDate">Due Date</option>
            <option value="priority">Priority</option>
          </select>
        </div>
      </div>

      <TaskList tasks={tasks} showProject emptyMessage="No tasks match your filters" />

      <button
        onClick={() => setAddingTask(true)}
        className="flex items-center gap-2 mt-3 px-3 py-2 text-sm rounded-lg transition-colors w-full"
        style={{ color: "var(--c-texTer)" }}
        onMouseOver={e => (e.currentTarget.style.backgroundColor = "var(--c-bacTer)")}
        onMouseOut={e => (e.currentTarget.style.backgroundColor = "")}
      >
        <Plus className="w-4 h-4" style={{ color: "var(--c-texDis)" }} />
        Add task
      </button>

      {addingTask && <TaskFormModal onClose={() => setAddingTask(false)} />}
    </AppLayout>
  );
}
