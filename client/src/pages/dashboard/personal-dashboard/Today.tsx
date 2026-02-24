import { format } from "date-fns";
import { AppLayout } from "../../../components/layout/dashboard/AppLayout";
import { AddTaskButton } from "../../../components/features/AddTaskButton";
import { TaskFormModal } from "../../../components/features/TaskFormModal";
import { TodayProgress } from "@/components/features/today/TodayProgress";
import { TodayTaskTable } from "@/components/features/today/TodayTaskTable";
import { TodayEmptyState } from "@/components/features/today/TodayEmptyState";
import { NoOrgState } from "@/components/features/today/NoOrgState";
import { useAuth } from "@/lib/auth/AuthContext";
import { useOrgMemberMap } from "@/lib/hooks/useOrgMemberMap";
import { useTaskToggle } from "@/lib/hooks/useTaskToggle";
import { useTodayData } from "@/lib/hooks/useTodayData";

export default function TodayPage() {
  const { activeOrg } = useAuth();
  const memberMap = useOrgMemberMap(activeOrg?.orgId);
  const { toggle, isToggling } = useTaskToggle(activeOrg?.orgId ?? "");
  
  const {
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
    today,
  } = useTodayData(activeOrg?.orgId);

  if (!activeOrg) {
    return <NoOrgState />;
  }

  return (
    <AppLayout
      title={format(today, "EEEE, MMMM d")}
      subtitle={isLoading ? "Loading today's tasks..." : `${pendingTasks.length} pending · ${doneTasks.length} done`}
    >
      {tasks.length > 0 && <TodayProgress progress={progress} />}

      {pendingTasks.length === 0 && doneTasks.length === 0 ? (
        <TodayEmptyState />
      ) : (
        <div className="space-y-8">
          <TodayTaskTable 
            rows={pendingTasks} 
            memberMap={memberMap} 
            onEdit={setEditingTask} 
            onToggle={toggle} 
            isToggling={isToggling} 
            title="Pending"
          />
          
          <TodayTaskTable 
            rows={doneTasks} 
            memberMap={memberMap} 
            onEdit={setEditingTask} 
            onToggle={toggle} 
            isToggling={isToggling} 
            faded 
            title="Completed"
          />
        </div>
      )}

      <AddTaskButton onClick={() => setAddingTask(true)} />
      {addingTask && <TaskFormModal defaultDueDate={todayStr} onClose={() => setAddingTask(false)} />}
      {editingTask && <TaskFormModal task={editingTask} onClose={() => setEditingTask(null)} />}
    </AppLayout>
  );
}