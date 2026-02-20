import { createFileRoute } from "@tanstack/react-router";
import SettingsPage from "../pages/dashboard/personal-dashboard/SettingsPage";

export const Route = createFileRoute('/dashboard/settings')({
  component: SettingsPage,
});