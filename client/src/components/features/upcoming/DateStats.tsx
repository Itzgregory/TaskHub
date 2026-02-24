interface DateStatsProps {
  totalDates: number;
}

export function DateStats({ totalDates }: DateStatsProps) {
  return (
    <span className="text-xs" style={{ color: "var(--c-texTer)" }}>
      {totalDates} date{totalDates !== 1 ? "s" : ""} with tasks
    </span>
  );
}