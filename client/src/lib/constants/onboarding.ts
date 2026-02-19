import { User2, Briefcase, BookOpen } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export const ONBOARDING_STEPS = ["Profile", "Workspace", "Preferences"] as const;

export const ROLES: { id: string; icon: LucideIcon; label: string; desc: string }[] = [
  { id: "personal", icon: User2, label: "Personal", desc: "Daily tasks & goals" },
  { id: "work", icon: Briefcase, label: "Work", desc: "Projects & deadlines" },
  { id: "student", icon: BookOpen, label: "Student", desc: "Assignments & study" },
];

export const THEMES = [
  { id: "light", label: "Light" },
  { id: "dark", label: "Dark" },
  { id: "system", label: "System" },
];

export const TIMEZONES = [
  "UTC-08:00 (Pacific Time)",
  "UTC-05:00 (Eastern Time)",
  "UTC+00:00 (GMT)",
  "UTC+01:00 (Central European)",
];