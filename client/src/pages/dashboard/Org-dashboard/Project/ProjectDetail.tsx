import { useParams } from "@tanstack/react-router";
import { AppLayout } from "@/components/layout/dashboard/AppLayout";
import { TaskFormModal } from "@/components/features/TaskFormModal";
import { useState } from "react";
import { useAuth } from "@/lib/auth/AuthContext";
import { useProjectData } from "@/lib/hooks/useProjectData";
import { ProjectBackButton } from "@/components/features/projectsDetails/ProjectBackButton";
import { ProjectHeader } from "@/components/features/projectsDetails/ProjectHeader";
import { TaskList } from "@/components/features/projectsDetails/TaskList";
import { MemberList } from "@/components/features/projectsDetails/MemberList";
import { ProjectLoading } from "@/components/features/projectsDetails/ProjectLoading";

export default function ProjectDetail() {
  const { projectId: orgId } = useParams({ from: "/dashboard/org/projects/$projectId" });
  const { organisations } = useAuth();
  const [addingTask, setAddingTask] = useState(false);

  const org = organisations.find(o => o.orgId === orgId);
  const { members, memberMap, openTasks, allTasks, stats, isLoading, today } = useProjectData(orgId);

  if (isLoading) return <ProjectLoading />;

  return (
    <AppLayout title={org?.orgName ?? "Project"} subtitle="Project overview">
      <ProjectBackButton />

      <ProjectHeader
        orgName={org?.orgName ?? orgId}
        orgId={orgId}
        memberCount={members.length}
        taskCount={allTasks.length}
        stats={stats}
      />

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <TaskList
          tasks={allTasks}
          memberMap={memberMap}
          today={today}
          onAddTask={() => setAddingTask(true)}
        />

        <MemberList
          members={members}
          openTasks={openTasks}
        />
      </div>

      {addingTask && (
        <TaskFormModal
          defaultOrgId={orgId}
          onClose={() => setAddingTask(false)}
        />
      )}
    </AppLayout>
  );
}