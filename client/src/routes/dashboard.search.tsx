import { createFileRoute } from "@tanstack/react-router";
import SearchPage from "../pages/dashboard/personal-dashboard/SearchPage";

export const Route = createFileRoute('/dashboard/search')({
  component: SearchPage,
});