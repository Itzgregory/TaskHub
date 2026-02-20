interface ProgressBarProps {
    /** Percentage value (0–100) */
    value: number;
    /** Bar fill color */
    color?: string;
    /** Optional height class override, defaults to h-1.5 */
    heightClass?: string;
}

/**
 * A simple, reusable progress bar. Replaces the identical inline progress bar
 * divs in OrgDashboard (workload), TeamProjects (project cards), and MemberDetail.
 */
export function ProgressBar({
    value,
    color = "var(--c-bluTexAccPri)",
    heightClass = "h-1.5",
}: ProgressBarProps) {
    return (
        <div
            className={`${heightClass} rounded-full overflow-hidden`}
            style={{ backgroundColor: "var(--c-bacTer)" }}
        >
            <div
                className={`${heightClass} rounded-full transition-all`}
                style={{ width: `${Math.min(100, Math.max(0, value))}%`, backgroundColor: color }}
            />
        </div>
    );
}
