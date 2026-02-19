import { createFileRoute } from "@tanstack/react-router";
import ProjectPage from "../pages/dashboard/Project";

export const Route = createFileRoute('/dashboard/projects/$projectId')({
  component: ProjectPage,
});