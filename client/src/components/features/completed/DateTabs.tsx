interface DateTabsProps {
  dates: string[];
  selectedDate: string | null;
  taskCounts: Record<string, number>;
  onDateSelect: (date: string) => void;
  formatDate: (date: string) => string;
}

export function DateTabs({ dates, selectedDate, taskCounts, onDateSelect, formatDate }: DateTabsProps) {
  return (
    <div className="flex flex-wrap gap-2 border-b pb-2" style={{ borderColor: "var(--c-borPri)" }}>
      {dates.map(date => (
        <button
          key={date}
          onClick={() => onDateSelect(date)}
          className={`px-3 py-1.5 text-xs font-medium rounded-t-lg transition-colors ${
            selectedDate === date 
              ? 'bg-[var(--c-bluTexAccPri)] text-[var(--c-bacPri)]' 
              : 'text-[var(--c-texSec)] hover:text-[var(--c-texPri)]'
          }`}
        >
          {formatDate(date)}
          <span className="ml-1.5 text-xs opacity-70">({taskCounts[date]})</span>
        </button>
      ))}
    </div>
  );
}