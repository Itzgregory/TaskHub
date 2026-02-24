import { ArrowLeft } from "lucide-react";
import { Link } from "@tanstack/react-router";

export function ProjectBackButton() {
  return (
    <Link
      to="/dashboard/org/projects"
      className="inline-flex items-center gap-1.5 text-xs font-medium mb-6 hover:underline"
      style={{ color: "var(--c-bluTexAccPri)" }}
    >
      <ArrowLeft className="w-3.5 h-3.5" /> Back to Projects
    </Link>
  );
}