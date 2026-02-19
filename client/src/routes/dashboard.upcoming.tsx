import { createFileRoute } from "@tanstack/react-router";
import UpcomingPage from "../pages/dashboard/Upcoming";

export const Route = createFileRoute('/dashboard/upcoming')({
  component: UpcomingPage,
});