import { createFileRoute } from "@tanstack/react-router";
import NotFound from "../pages/dashboard/NotFound";

export const Route = createFileRoute('/404')({
  component: NotFound,
});