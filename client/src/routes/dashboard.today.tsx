import { createFileRoute } from "@tanstack/react-router";
import TodayPage from "../pages/dashboard/personal-dashboard/Today";

export const Route = createFileRoute('/dashboard/today')({
  component: TodayPage,
});