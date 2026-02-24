// hooks/useUpcomingData.ts
import { useMemo, useState } from "react";
import { useTodos } from "@/lib/api/hooks";
import { mapTodoDtoToTask } from "@/lib/api/mappers";
import { groupByDueDate, getTodayStr, formatRelativeDate } from "@/lib/utils/tasks";
import { usePagination } from "@/lib/hooks/usePagination";
import type { Task } from "@/lib/types";

export function useUpcomingData(orgId?: string) {
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [addingTask, setAddingTask] = useState(false);

    const { data, isLoading } = useTodos({
        orgId: orgId || "",
        page: 1,
        pageSize: 100,
        status: "Open",
        sortBy: "dueDate",
        ascending: true,
    });

    const tasks = useMemo(() => {
        if (!data?.todos.items || !orgId) return [];

        const todayStr = getTodayStr();

        const filtered = data.todos.items
            .filter(todo => {
                if (!todo.dueDate) return false;
                const todoDate = todo.dueDate.split("T")[0];
                return todoDate > todayStr;
            })
            .map(todo => mapTodoDtoToTask(todo, orgId));

        return filtered;
    }, [data, orgId]);

    const grouped = groupByDueDate(tasks);
    const sortedDates = Object.keys(grouped).sort();

    // Derive the active date: use the explicitly selected date if it still exists,
    // otherwise fall back to the first available date (avoids setState-in-effect).
    const activeDate = useMemo(() => {
        if (selectedDate && grouped[selectedDate]) return selectedDate;
        return sortedDates[0] ?? null;
    }, [selectedDate, grouped, sortedDates]);

    const currentTasks = activeDate ? grouped[activeDate] || [] : [];

    const pagination = usePagination({
        items: currentTasks,
        pageSize: 5,
    });

    const getDisplayDate = (date: string) => {
        if (date === "no-date") return "No Date";
        return formatRelativeDate(date, "EEEE, MMMM d, yyyy");
    };

    return {
        tasks,
        grouped,
        sortedDates,
        selectedDate: activeDate,
        setSelectedDate,
        editingTask,
        setEditingTask,
        addingTask,
        setAddingTask,
        currentTasks,
        pagination,
        isLoading,
        getDisplayDate,
        formatDate: formatRelativeDate,
    };
}