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

// ─── Audit action metadata (maps backend AuditAction → UI) ──────────────────

// These strings match the backend AuditAction enum values as serialised to JSON
export type AuditActionType =
    | "TodoCreated" | "TodoUpdated" | "TodoSoftDeleted" | "TodoRestored"
    | "TodoHardDeleted" | "TodoArchived"
    | "OrgCreated" | "MemberAdded" | "MemberRemoved" | "RoleChanged"
    | "TodosImported" | "TodosExported"
    | "LoginSuccess" | "LoginFailed" | "Logout";

export interface AuditActionMeta {
    icon: LucideIcon;
    color: string;
    label: string;
    entityLabel: string; // human-readable entity context, e.g. "a todo", "a member"
}

export const AUDIT_ACTION_META: Record<string, AuditActionMeta> = {
    TodoCreated: { icon: Plus, color: "var(--c-greTexAccPri)", label: "created a task", entityLabel: "Task" },
    TodoUpdated: { icon: ArrowRight, color: "var(--c-bluTexAccPri)", label: "updated a task", entityLabel: "Task" },
    TodoSoftDeleted: { icon: FileText, color: "var(--c-redTexAccPri)", label: "deleted a task", entityLabel: "Task" },
    TodoRestored: { icon: CheckCircle2, color: "var(--c-greTexAccPri)", label: "restored a task", entityLabel: "Task" },
    TodoHardDeleted: { icon: FileText, color: "var(--c-redTexAccPri)", label: "permanently deleted a task", entityLabel: "Task" },
    TodoArchived: { icon: FileText, color: "var(--c-texTer)", label: "archived tasks", entityLabel: "Task" },
    OrgCreated: { icon: Plus, color: "var(--c-yelTexAccPri)", label: "created organisation", entityLabel: "Organisation" },
    MemberAdded: { icon: UserPlus, color: "var(--c-bluTexAccPri)", label: "added a member", entityLabel: "Member" },
    MemberRemoved: { icon: UserPlus, color: "var(--c-oraTexAccPri)", label: "removed a member", entityLabel: "Member" },
    RoleChanged: { icon: ShieldCheck, color: "var(--c-yelTexAccPri)", label: "changed a member's role", entityLabel: "Member" },
    TodosImported: { icon: FileText, color: "var(--c-bluTexAccPri)", label: "imported tasks", entityLabel: "Import" },
    TodosExported: { icon: FileText, color: "var(--c-bluTexAccPri)", label: "exported tasks", entityLabel: "Export" },
    LoginSuccess: { icon: CheckCircle2, color: "var(--c-greTexAccPri)", label: "logged in", entityLabel: "Auth" },
    LoginFailed: { icon: MessageSquare, color: "var(--c-redTexAccPri)", label: "failed login attempt", entityLabel: "Auth" },
    Logout: { icon: ArrowRight, color: "var(--c-texTer)", label: "logged out", entityLabel: "Auth" },
};

export const DEFAULT_AUDIT_META: AuditActionMeta = {
    icon: MessageSquare,
    color: "var(--c-texTer)",
    label: "performed an action",
    entityLabel: "System",
};

// ─── Status styling (shared by TeamProjects + ProjectDetail) ──────────────────

export const STATUS_STYLE: Record<string, { bg: string; color: string; label: string }> = {
    active: { bg: "var(--c-greBacSec)", color: "var(--c-greTexAccPri)", label: "Active" },
    inactive: { bg: "var(--c-bacTer)", color: "var(--c-texTer)", label: "Inactive" },
    "on-hold": { bg: "var(--c-yelBacSec)", color: "var(--c-yelTexAccPri)", label: "On Hold" },
    completed: { bg: "var(--c-bluBacSec)", color: "var(--c-bluTexAccPri)", label: "Completed" },
};
