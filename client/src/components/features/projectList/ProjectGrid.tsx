import { ProjectCard } from "./ProjectCard";

interface ProjectGridProps {
  projects: Array<{
    id: string;
    name: string;
    status: "active" | "archived";
    joinedAt: string;
  }>;
}

export function ProjectGrid({ projects }: ProjectGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {projects.map(project => (
        <ProjectCard
          key={project.id}
          id={project.id}
          name={project.name}
          status={project.status}
          joinedAt={project.joinedAt}
        />
      ))}
    </div>
  );
}