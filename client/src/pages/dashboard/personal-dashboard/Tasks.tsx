import { AppLayout } from "../../../components/layout/dashboard/AppLayout";
import { AddTaskButton } from "../../../components/features/AddTaskButton";
import { TaskFormModal } from "../../../components/features/TaskFormModal";
import { TablePagination } from "../../../components/features/TablePagination";
import { TasksFilterBar } from "@/components/features/task/TasksFilterBar";
import { TasksTable } from "@/components/features/task/TasksTable";
import { NoOrgState } from "@/components/features/task/NoOrgState";
import { useAuth } from "@/lib/auth/AuthContext";
import { useOrgMemberMap } from "@/lib/hooks/useOrgMemberMap";
import { useTaskToggle } from "@/lib/hooks/useTaskToggle";
import { useTasksData } from "@/lib/hooks/useTasksData";

export default function TasksPage() {
  const { activeOrg } = useAuth();
  const memberMap = useOrgMemberMap(activeOrg?.orgId);
  const { toggle, isToggling } = useTaskToggle(activeOrg?.orgId ?? "");

  const {
    allTasks,
    filteredTasks,
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
  } = useTasksData(activeOrg?.orgId);

  if (!activeOrg) {
    return <NoOrgState />;
  }

  return (
    <AppLayout
      title="All Tasks"
      subtitle={isLoading ? "Loading tasks..." : `${allTasks.length} task${allTasks.length !== 1 ? "s" : ""}`}
    >
      <TasksFilterBar
        filterStatus={filterStatus}
        onFilterChange={setFilterStatus}
        sortBy={sortBy}
        onSortChange={setSortBy}
      />

      <TasksTable
        isLoading={isLoading}
        tasks={filteredTasks}
        memberMap={memberMap}
        onEdit={setEditingTask}
        onToggle={toggle}
        isToggling={isToggling}
        startIndex={pagination.startIndex}
      />

      {!isLoading && allTasks.length > 0 && (
        <TablePagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          totalItems={allTasks.length}
          startIndex={pagination.startIndex}
          endIndex={pagination.endIndex}
          itemsPerPage={pagination.itemsPerPage}
          onPageChange={pagination.goToPage}
          onItemsPerPageChange={pagination.setItemsPerPage}
        />
      )}

      <AddTaskButton onClick={() => setAddingTask(true)} />
      {addingTask && <TaskFormModal onClose={() => setAddingTask(false)} />}
      {editingTask && <TaskFormModal task={editingTask} onClose={() => setEditingTask(null)} />}
    </AppLayout>
  );
}