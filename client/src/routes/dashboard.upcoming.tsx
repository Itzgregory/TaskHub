import { createFileRoute } from "@tanstack/react-router";
import UpcomingPage from "../pages/dashboard/personal-dashboard/Upcoming";

export const Route = createFileRoute('/dashboard/upcoming')({
  component: UpcomingPage,
});