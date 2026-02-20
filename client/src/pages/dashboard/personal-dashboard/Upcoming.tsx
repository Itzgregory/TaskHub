import { useMemo, useState } from "react";
import { CalendarDays } from "lucide-react";
import { AppLayout } from "../../../components/layout/dashboard/AppLayout";
import { DateGroupSection } from "../../../components/features/DateGroupSection";
import { AddTaskButton } from "../../../components/features/AddTaskButton";
import { EmptyState } from "../../../components/features/EmptyState";
import { TaskFormModal } from "../../../components/features/TaskFormModal";
import { useAuth } from "@/lib/auth/AuthContext";
import { useTodos } from "@/lib/api/hooks";
import { mapTodoDtoToTask } from "@/lib/api/mappers";
import { groupByDueDate, formatRelativeDate, getTodayStr } from "@/lib/utils/tasks";

export default function UpcomingPage() {
  const { activeOrg } = useAuth();
  const [addingTask, setAddingTask] = useState(false);

  const { data, isLoading } = useTodos({
    orgId: activeOrg?.orgId || "",
    page: 1,
    pageSize: 100,
    status: "Open",
    sortBy: "dueDate",
    ascending: true,
  });

  const tasks = useMemo(() => {
    if (!data?.todos.items || !activeOrg) return [];
    const todayStr = getTodayStr();
    return data.todos.items
      .filter((todo) => todo.dueDate && todo.dueDate.split("T")[0] > todayStr)
      .map((todo) => mapTodoDtoToTask(todo, activeOrg.orgId));
  }, [data, activeOrg]);

  const grouped = groupByDueDate(tasks);
  const sortedDates = Object.keys(grouped).sort();

  if (!activeOrg) {
    return (
      <AppLayout title="Upcoming" subtitle="Please select an organisation">
        <EmptyState
          icon={<CalendarDays className="w-6 h-6" style={{ color: "var(--c-texDis)" }} />}
          title="No organisation selected."
        />
      </AppLayout>
    );
  }

  return (
    <AppLayout
      title="Upcoming"
      subtitle={isLoading ? "Loading upcoming tasks..." : "Future tasks with due dates"}
    >
      {sortedDates.length === 0 ? (
        <EmptyState
          icon={<CalendarDays className="w-6 h-6" style={{ color: "var(--c-texDis)" }} />}
          title="Nothing upcoming"
          description="Add tasks with future due dates"
        />
      ) : (
        <div className="space-y-8 animate-fade-in">
          {sortedDates.map((date) => (
            <DateGroupSection
              key={date}
              label={date === "no-date" ? "No Date" : formatRelativeDate(date, "EEEE, MMMM d")}
              tasks={grouped[date]}
              showProject
            />
          ))}
        </div>
      )}

      <AddTaskButton onClick={() => setAddingTask(true)} />
      {addingTask && <TaskFormModal onClose={() => setAddingTask(false)} />}
    </AppLayout>
  );
}
