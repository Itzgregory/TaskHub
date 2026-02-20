import { Crown, ShieldCheck, UserCircle, Shield } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
    CheckCircle2, MessageSquare, Plus, UserPlus, ArrowRight, FileText,
} from "lucide-react";

// ─── Role metadata (shared by TeamMembers + MemberDetail) ────────────────────

export type UiRole = "owner" | "admin" | "member" | "viewer";

export const ROLE_META: Record<UiRole, { icon: LucideIcon; label: string; color: string }> = {
    owner: { icon: Crown, label: "Owner", color: "var(--c-yelTexAccPri)" },
    admin: { icon: ShieldCheck, label: "Admin", color: "var(--c-bluTexAccPri)" },
    member: { icon: UserCircle, label: "Member", color: "var(--c-greTexAccPri)" },
    viewer: { icon: Shield, label: "Viewer", color: "var(--c-texTer)" },
};

// ─── Activity type metadata (shared by TeamsActivity + ActivityDetail) ────────

export type ActivityType = "complete" | "comment" | "create" | "assign" | "move" | "upload";

export const ACTIVITY_TYPE_ICON: Record<ActivityType, LucideIcon> = {
    complete: CheckCircle2,
    comment: MessageSquare,
    create: Plus,
    assign: UserPlus,
    move: ArrowRight,
    upload: FileText,
};

export const ACTIVITY_TYPE_COLOR: Record<ActivityType, string> = {
    complete: "var(--c-greTexAccPri)",
    comment: "var(--c-bluTexAccPri)",
    create: "var(--c-yelTexAccPri)",
    assign: "var(--c-oraTexAccPri)",
    move: "var(--c-texTer)",
    upload: "var(--c-bluTexAccPri)",
};

// ─── Status styling (shared by TeamProjects + ProjectDetail) ──────────────────

export const STATUS_STYLE: Record<string, { bg: string; color: string; label: string }> = {
    active: { bg: "var(--c-greBacSec)", color: "var(--c-greTexAccPri)", label: "Active" },
    inactive: { bg: "var(--c-bacTer)", color: "var(--c-texTer)", label: "Inactive" },
    "on-hold": { bg: "var(--c-yelBacSec)", color: "var(--c-yelTexAccPri)", label: "On Hold" },
    completed: { bg: "var(--c-bluBacSec)", color: "var(--c-bluTexAccPri)", label: "Completed" },
};
