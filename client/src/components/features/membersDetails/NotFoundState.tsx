import { ArrowLeft } from "lucide-react";
import { AppLayout } from "@/components/layout/dashboard/AppLayout";
import { Link } from "@tanstack/react-router";

export function NotFoundState() {
  return (
    <AppLayout title="Member not found" subtitle="">
      <Link to="/dashboard/org/members" className="inline-flex items-center gap-1.5 text-xs font-medium mb-6 hover:underline" style={{ color: "var(--c-bluTexAccPri)" }}>
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Members
      </Link>
      <p className="text-sm" style={{ color: "var(--c-texTer)" }}>This member could not be found in the current organisation.</p>
    </AppLayout>
  );
}