import { Calendar, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface DateDropdownProps {
  selectedDate: string | null;
  dates: string[];
  taskCounts: Record<string, number>;
  onDateSelect: (date: string) => void;
  getDisplayDate: (date: string) => string;
}

export function DateDropdown({ selectedDate, dates, taskCounts, onDateSelect, getDisplayDate }: DateDropdownProps) {
  return (
    <div className="flex items-center gap-2">
      <Calendar className="w-4 h-4" style={{ color: "var(--c-texTer)" }} />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            className="w-[300px] justify-between text-sm font-normal"
            style={{ 
              backgroundColor: "var(--c-bacEle)", 
              borderColor: "var(--c-borPri)",
              color: "var(--c-texPri)" 
            }}
          >
            <span className="truncate">
              {selectedDate ? getDisplayDate(selectedDate) : "Select a date"}
            </span>
            <ChevronDown className="w-4 h-4 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent 
          className="w-[300px] max-h-[400px] overflow-y-auto"
          style={{ 
            backgroundColor: "var(--c-bacEle)", 
            borderColor: "var(--c-borPri)" 
          }}
        >
          {dates.map(date => (
            <DropdownMenuItem
              key={date}
              onClick={() => onDateSelect(date)}
              className="flex items-center justify-between py-2"
              style={{
                backgroundColor: selectedDate === date ? "var(--c-bacTer)" : "transparent",
              }}
            >
              <span className="text-sm" style={{ color: "var(--c-texPri)" }}>
                {getDisplayDate(date)}
              </span>
              <span 
                className="text-xs px-1.5 py-0.5 rounded-md ml-2"
                style={{ backgroundColor: "var(--c-bacTer)", color: "var(--c-texTer)" }}
              >
                {taskCounts[date]}
              </span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}