import { AppLayout } from "../../../components/layout/dashboard/AppLayout";
import { AddTaskButton } from "../../../components/features/AddTaskButton";
import { TaskFormModal } from "../../../components/features/TaskFormModal";
import { EmptyState } from "../../../components/features/EmptyState";
import { UpcomingView } from "@/components/features/upcoming/UpcomingView";
import { UpcomingEmptyState } from "@/components/features/upcoming/UpcomingEmptyState";
import { useAuth } from "@/lib/auth/AuthContext";
import { useOrgMemberMap } from "@/lib/hooks/useOrgMemberMap";
import { useTaskToggle } from "@/lib/hooks/useTaskToggle";
import { useUpcomingData } from "@/lib/hooks/useUpcomingData";
import { CalendarDays } from "lucide-react";

export default function UpcomingPage() {
  const { activeOrg } = useAuth();
  const memberMap = useOrgMemberMap(activeOrg?.orgId);
  const { toggle, isToggling } = useTaskToggle(activeOrg?.orgId ?? "");
  
  const {
    tasks,
    grouped,
    sortedDates,
    selectedDate,
    setSelectedDate,
    editingTask,
    setEditingTask,
    addingTask,
    setAddingTask,
    currentTasks,
    pagination,
    isLoading,
    getDisplayDate,
    formatDate,
  } = useUpcomingData(activeOrg?.orgId);

  if (!activeOrg) {
    return (
      <AppLayout title="Upcoming" subtitle="Please select an organisation">
        <EmptyState icon={<CalendarDays className="w-6 h-6" style={{ color: "var(--c-texDis)" }} />} title="No organisation selected." />
      </AppLayout>
    );
  }

  return (
    <AppLayout
      title="Upcoming"
      subtitle={isLoading ? "Loading upcoming tasks..." : `${tasks.length} task${tasks.length !== 1 ? "s" : ""} with future due dates`}
    >
      {sortedDates.length === 0 ? (
        <UpcomingEmptyState />
      ) : (
        <UpcomingView
          sortedDates={sortedDates}
          selectedDate={selectedDate}
          grouped={grouped}
          onDateSelect={(date) => {
            setSelectedDate(date);
            pagination.goToPage(1);
          }}
          getDisplayDate={getDisplayDate}
          formatDate={formatDate}
          currentTasks={currentTasks}
          memberMap={memberMap}
          onEdit={setEditingTask}
          onToggle={toggle}
          isToggling={isToggling}
          pagination={{
            currentPage: pagination.currentPage,
            totalPages: pagination.totalPages,
            itemsPerPage: pagination.itemsPerPage,
            totalItems: currentTasks.length,
            startIndex: pagination.startIndex,
            endIndex: pagination.endIndex,
            onPageChange: pagination.goToPage,
            onItemsPerPageChange: pagination.setItemsPerPage,
          }}
        />
      )}

      <AddTaskButton onClick={() => setAddingTask(true)} />
      {addingTask && <TaskFormModal onClose={() => setAddingTask(false)} />}
      {editingTask && <TaskFormModal task={editingTask} onClose={() => setEditingTask(null)} />}
    </AppLayout>
  );
}