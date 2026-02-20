import { createFileRoute } from "@tanstack/react-router";
import ProjectPage from "../pages/dashboard/personal-dashboard/Project";

export const Route = createFileRoute('/dashboard/projects/$projectId')({
  component: ProjectPage,
});