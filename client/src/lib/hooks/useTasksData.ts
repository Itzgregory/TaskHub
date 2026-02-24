import { useState, useMemo } from "react";
import { useTodos } from "@/lib/api/hooks";
import { mapTodoDtoToTask } from "@/lib/api/mappers";
import { PRIORITY_WEIGHT } from "@/lib/utils/tasks";
import { usePagination } from "@/lib/hooks/usePagination";
import type { Task } from "@/lib/types";
import type { FilterStatus, SortBy } from "@/lib/utils/filter";

export function useTasksData(orgId?: string) {
  const [addingTask, setAddingTask] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const [sortBy, setSortBy] = useState<SortBy>("order");

  const apiStatus = filterStatus === "all" ? undefined : filterStatus === "open" ? "Open" : "Done";

  const { data, isLoading } = useTodos({
    orgId: orgId || "",
    page: 1,
    pageSize: 100,
    status: apiStatus,
  });

  const allTasks = useMemo(() => {
    if (!data?.todos.items || !orgId) return [];
    const mapped = data.todos.items.map(todo => mapTodoDtoToTask(todo, orgId));
    mapped.sort((a, b) => {
      if (sortBy === "priority") return PRIORITY_WEIGHT[a.priority] - PRIORITY_WEIGHT[b.priority];
      if (sortBy === "dueDate") return (a.dueDate ?? "9999").localeCompare(b.dueDate ?? "9999");
      return a.title.localeCompare(b.title);
    });
    return mapped;
  }, [data, orgId, sortBy]);

  const pagination = usePagination({
    items: allTasks,
    pageSize: 5,
  });

  return {
    allTasks,
    filteredTasks: pagination.paginatedItems,
    filterStatus,
    setFilterStatus,
    sortBy,
    setSortBy,
    addingTask,
    setAddingTask,
    editingTask,
    setEditingTask,
    isLoading,
    pagination,
  };
}