import { useMemo, useState } from "react";
import { useTodos } from "@/lib/api/hooks";
import { mapTodoDtoToTask } from "@/lib/api/mappers";
import { groupByCompletedDate } from "@/lib/utils/tasks";
import { usePagination } from "@/lib/hooks/usePagination";
import type { Task } from "@/lib/types";

export function useCompletedData(orgId?: string) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const { data, isLoading } = useTodos({
    orgId: orgId || "",
    page: 1,
    pageSize: 100,
    status: "Done",
    sortBy: "updatedAt",
    ascending: false,
  });

  const tasks = useMemo(() => {
    if (!data?.todos.items || !orgId) return [];
    return data.todos.items.map(todo => mapTodoDtoToTask(todo, orgId));
  }, [data, orgId]);

  const grouped = groupByCompletedDate(tasks);
  const sortedDates = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

  const effectiveDate = useMemo(
    () => selectedDate ?? sortedDates[0] ?? null,
    [selectedDate, sortedDates]
  );

  const currentTasks = effectiveDate ? grouped[effectiveDate] || [] : [];

  const pagination = usePagination({
    items: currentTasks,
    pageSize: 5,
  });

  return {
    tasks,
    grouped,
    sortedDates,
    selectedDate: effectiveDate,
    setSelectedDate,
    editingTask,
    setEditingTask,
    currentTasks,
    pagination,
    isLoading,
  };
}