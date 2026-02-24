import { AppLayout } from "../../../components/layout/dashboard/AppLayout";
import { TaskFormModal } from "../../../components/features/TaskFormModal";
import { EmptyState } from "../../../components/features/EmptyState";
import { CompletedView } from "@/components/features/completed/CompletedView";
import { CompletedEmptyState } from "@/components/features/completed/CompletedEmptyState";
import { useAuth } from "@/lib/auth/AuthContext";
import { useOrgMemberMap } from "@/lib/hooks/useOrgMemberMap";
import { useTaskToggle } from "@/lib/hooks/useTaskToggle";
import { useCompletedData } from "@/lib/hooks/useCompletedData";
import { formatRelativeDate } from "@/lib/utils/tasks";
import { CheckCircle2 } from "lucide-react";

export default function CompletedPage() {
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
    currentTasks,
    pagination,
    isLoading,
  } = useCompletedData(activeOrg?.orgId);

  if (!activeOrg) {
    return (
      <AppLayout title="Completed" subtitle="Please select an organisation">
        <EmptyState icon={<CheckCircle2 className="w-6 h-6" style={{ color: "var(--c-texDis)" }} />} title="No organisation selected." />
      </AppLayout>
    );
  }

  return (
    <AppLayout
      title="Completed"
      subtitle={isLoading ? "Loading..." : `${tasks.length} completed task${tasks.length !== 1 ? "s" : ""}`}
    >
      {sortedDates.length === 0 ? (
        <CompletedEmptyState />
      ) : (
        <CompletedView
          sortedDates={sortedDates}
          selectedDate={selectedDate}
          grouped={grouped}
          onDateSelect={(date) => {
            setSelectedDate(date);
            pagination.goToPage(1);
          }}
          formatDate={formatRelativeDate}
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

      {editingTask && <TaskFormModal task={editingTask} onClose={() => setEditingTask(null)} />}
    </AppLayout>
  );
}