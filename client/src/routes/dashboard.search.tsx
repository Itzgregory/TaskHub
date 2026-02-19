import { createFileRoute } from "@tanstack/react-router";
import SearchPage from "../pages/dashboard/SearchPage";

export const Route = createFileRoute('/dashboard/search')({
  component: SearchPage,
});