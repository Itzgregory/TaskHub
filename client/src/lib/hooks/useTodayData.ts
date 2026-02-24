import { useState, useMemo } from "react";
import { useTodos } from "@/lib/api/hooks";
import { mapTodoDtoToTask } from "@/lib/api/mappers";
import { getTodayStr } from "@/lib/utils/tasks";
import type { Task } from "@/lib/types";

export function useTodayData(orgId?: string) {
  const [addingTask, setAddingTask] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const todayStr = getTodayStr();

  const { data: todosData, isLoading } = useTodos({
    orgId: orgId || "",
    page: 1,
    pageSize: 100,
    includeArchived: false,
    includeDeleted: false,
  });

  const tasks = useMemo(() => {
    if (!todosData?.todos.items || !orgId) return [];
    
    return todosData.todos.items
      .filter(todo => todo.dueDate && todo.dueDate.split("T")[0] === todayStr)
      .map(todo => mapTodoDtoToTask(todo, orgId))
      .sort((a, b) => {
        const w: Record<string, number> = { urgent: 0, high: 1, medium: 2, low: 3, none: 4 };
        const diff = w[a.priority] - w[b.priority];
        return diff !== 0 ? diff : (a.dueDate || "").localeCompare(b.dueDate || "");
      });
  }, [todosData, orgId, todayStr]);

  const doneTasks = tasks.filter(t => t.status === "done");
  const pendingTasks = tasks.filter(t => t.status !== "done");
  const progress = tasks.length > 0 ? Math.round((doneTasks.length / tasks.length) * 100) : 0;

  return {
    tasks,
    doneTasks,
    pendingTasks,
    progress,
    isLoading,
    addingTask,
    setAddingTask,
    editingTask,
    setEditingTask,
    todayStr,
    today: new Date(todayStr),
  };
}