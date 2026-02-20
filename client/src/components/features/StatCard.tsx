import type { LucideIcon } from "lucide-react";

interface StatCardProps {
    label: string;
    value: string | number;
    icon?: LucideIcon;
    accent?: string;
    bg?: string;
    change?: string;
    up?: boolean;
}

/**
 * A KPI stat card used on the org dashboard and profile page.
 * Replaces the inline stat card JSX that was repeated across OrgDashboard and ProfilePage.
 */
export function StatCard({ label, value, icon: Icon, accent, bg, change, up }: StatCardProps) {
    return (
        <div
            className="rounded-xl p-4 flex flex-col gap-3"
            style={{ backgroundColor: "var(--c-bacSec)", border: "1px solid var(--c-borPri)" }}
        >
            {Icon && (
                <div className="flex items-center justify-between">
                    <div
                        className="w-9 h-9 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: bg }}
                    >
                        <Icon className="w-4 h-4" style={{ color: accent }} />
                    </div>
                    {change && (
                        <span
                            className="text-xs font-medium"
                            style={{ color: up ? "var(--c-greTexAccPri)" : "var(--c-redTexAccPri)" }}
                        >
                            {change}
                        </span>
                    )}
                </div>
            )}
            <div className={Icon ? "" : "text-center"}>
                <div
                    className={`text-2xl font-semibold ${Icon ? "" : "font-mono"}`}
                    style={{ color: "var(--c-texPri)" }}
                >
                    {value}
                </div>
                <div className="text-xs mt-0.5" style={{ color: "var(--c-texTer)" }}>
                    {label}
                </div>
            </div>
        </div>
    );
}
