import { useMemo } from "react";
import { CheckCircle2 } from "lucide-react";
import { AppLayout } from "../../../components/layout/dashboard/AppLayout";
import { DateGroupSection } from "../../../components/features/DateGroupSection";
import { EmptyState } from "../../../components/features/EmptyState";
import { useAuth } from "@/lib/auth/AuthContext";
import { useTodos } from "@/lib/api/hooks";
import { mapTodoDtoToTask } from "@/lib/api/mappers";
import { groupByCompletedDate, formatRelativeDate } from "@/lib/utils/tasks";

export default function CompletedPage() {
  const { activeOrg } = useAuth();
  const { data, isLoading } = useTodos({
    orgId: activeOrg?.orgId || "",
    page: 1,
    pageSize: 100,
    status: "Done",
    sortBy: "updatedAt",
    ascending: false,
  });

  const tasks = useMemo(() => {
    if (!data?.todos.items || !activeOrg) return [];
    return data.todos.items.map((todo) => mapTodoDtoToTask(todo, activeOrg.orgId));
  }, [data, activeOrg]);

  const grouped = groupByCompletedDate(tasks);
  const sortedDates = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

  if (!activeOrg) {
    return (
      <AppLayout title="Completed" subtitle="Please select an organisation">
        <EmptyState
          icon={<CheckCircle2 className="w-6 h-6" style={{ color: "var(--c-texDis)" }} />}
          title="No organisation selected."
        />
      </AppLayout>
    );
  }

  return (
    <AppLayout
      title="Completed"
      subtitle={isLoading ? "Loading..." : `${tasks.length} completed task${tasks.length !== 1 ? "s" : ""}`}
    >
      {sortedDates.length === 0 ? (
        <EmptyState
          icon={<CheckCircle2 className="w-6 h-6" style={{ color: "var(--c-texDis)" }} />}
          title="No completed tasks yet"
          description="Complete tasks to see them here"
        />
      ) : (
        <div className="space-y-8 animate-fade-in">
          {sortedDates.map((date) => (
            <DateGroupSection
              key={date}
              label={formatRelativeDate(date)}
              tasks={grouped[date]}
              showProject
              taskOpacity={0.75}
            />
          ))}
        </div>
      )}
    </AppLayout>
  );
}
