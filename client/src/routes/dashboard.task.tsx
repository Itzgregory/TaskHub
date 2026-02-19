import { createFileRoute } from "@tanstack/react-router";
import TasksPage from "../pages/dashboard/Tasks";

export const Route = createFileRoute('/dashboard/task')({
  component: TasksPage,
});