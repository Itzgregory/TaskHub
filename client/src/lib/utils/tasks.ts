import { format } from "date-fns";
import type { Task, Priority } from "../types";

// ─── Priority ────────────────────────────────────────────────────────────────

export const PRIORITY_WEIGHT: Record<Priority, number> = {
    urgent: 0,
    high: 1,
    medium: 2,
    low: 3,
    none: 4,
};

// ─── Date helpers ─────────────────────────────────────────────────────────────

/** Returns today's ISO date string (YYYY-MM-DD) — pure function, no Date.now */
export function getTodayStr(): string {
    return new Date().toISOString().slice(0, 10);
}

/** Returns yesterday's ISO date string (YYYY-MM-DD) */
export function getYesterdayStr(): string {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d.toISOString().slice(0, 10);
}

/** Returns tomorrow's ISO date string (YYYY-MM-DD) */
export function getTomorrowStr(): string {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().slice(0, 10);
}

/**
 * Formats a YYYY-MM-DD date string into a human-readable label,
 * with special cases for Today / Yesterday / Tomorrow.
 */
export function formatRelativeDate(dateStr: string, pattern = "MMMM d, yyyy"): string {
    const today = getTodayStr();
    const yesterday = getYesterdayStr();
    const tomorrow = getTomorrowStr();
    if (dateStr === today) return "Today";
    if (dateStr === yesterday) return "Yesterday";
    if (dateStr === tomorrow) return "Tomorrow";
    return format(new Date(dateStr + "T00:00:00"), pattern);
}

// ─── Grouping helpers ─────────────────────────────────────────────────────────

/** Groups tasks by their due date (YYYY-MM-DD or "no-date"). */
export function groupByDueDate(tasks: Task[]): Record<string, Task[]> {
    return tasks.reduce<Record<string, Task[]>>((acc, task) => {
        const key = task.dueDate ?? "no-date";
        (acc[key] ??= []).push(task);
        return acc;
    }, {});
}

/** Groups tasks by the date they were completed (YYYY-MM-DD or "unknown"). */
export function groupByCompletedDate(tasks: Task[]): Record<string, Task[]> {
    return tasks.reduce<Record<string, Task[]>>((acc, task) => {
        const key = task.completedAt?.slice(0, 10) ?? "unknown";
        (acc[key] ??= []).push(task);
        return acc;
    }, {});
}

// ─── Data export ──────────────────────────────────────────────────────────────

/** Triggers a JSON file download of the given data object. */
export function downloadJson(data: unknown, filename = "taskhub-data.json"): void {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}
