import { useState, useMemo } from "react";
import { FolderKanban } from "lucide-react";
import { AppLayout } from "@/components/layout/dashboard/AppLayout";
import { EmptyState } from "@/components/features/EmptyState";
import { ProjectSearch } from "@/components/features/projectList/ProjectSearch";
import { ProjectGrid } from "@/components/features/projectList/ProjectGrid";
import { useProjects } from "@/lib/hooks/useProjects";

export default function TeamProjects() {
  const [search, setSearch] = useState("");
  const { projects, filteredProjects } = useProjects();

  const filtered = useMemo(
    () => filteredProjects(search),
    [filteredProjects, search]
  );

  return (
    <AppLayout title="Team Projects" subtitle={`${projects.length} shared workspaces`}>
      <ProjectSearch value={search} onChange={setSearch} />

      {filtered.length > 0 ? (
        <ProjectGrid projects={filtered} />
      ) : (
        <EmptyState
          icon={<FolderKanban className="w-8 h-8" style={{ color: "var(--c-texDis)" }} />}
          title="No projects found"
        />
      )}
    </AppLayout>
  );
}