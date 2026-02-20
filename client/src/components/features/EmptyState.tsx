import type { ReactNode } from "react";

interface EmptyStateProps {
    icon: ReactNode;
    title: string;
    description?: string;
    className?: string;
}

/**
 * Generic centred empty-state placeholder used across all dashboard pages.
 * Replaces the identical inline empty-state divs scattered throughout pages.
 */
export function EmptyState({ icon, title, description, className = "" }: EmptyStateProps) {
    return (
        <div className={`flex flex-col items-center justify-center py-16 text-center animate-fade-in ${className}`}>
            <div
                className="w-12 h-12 rounded-full flex items-center justify-center mb-3"
                style={{ backgroundColor: "var(--c-bacTer)" }}
            >
                {icon}
            </div>
            <p className="text-sm font-medium" style={{ color: "var(--c-texTer)" }}>
                {title}
            </p>
            {description && (
                <p className="text-xs mt-1" style={{ color: "var(--c-texDis)" }}>
                    {description}
                </p>
            )}
        </div>
    );
}
