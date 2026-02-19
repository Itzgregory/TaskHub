import LandingPage from "@/pages/landing/LandingPage";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute('/')({
  component: LandingPage,
});