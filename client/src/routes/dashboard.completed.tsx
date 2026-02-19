import { createFileRoute } from "@tanstack/react-router";
import CompletedPage from "../pages/dashboard/Completed";

export const Route = createFileRoute('/dashboard/completed')({
  component: CompletedPage,
});