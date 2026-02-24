import { StatCard } from "@/components/features/StatCard";
import { FolderKanban, CheckCircle2, AlertCircle, Users } from "lucide-react";

interface StatCardsProps {
  openCount: number;
  doneCount: number;
  overdueCount: number;
  memberCount: number;
}

export function StatCards({ openCount, doneCount, overdueCount, memberCount }: StatCardsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <StatCard 
        label="Open Todos" 
        value={openCount} 
        icon={FolderKanban} 
        accent="var(--c-bluTexAccPri)" 
        bg="var(--c-bluBacSec)" 
      />
      <StatCard 
        label="Completed Todos" 
        value={doneCount} 
        icon={CheckCircle2} 
        accent="var(--c-greTexAccPri)" 
        bg="var(--c-greBacSec)" 
      />
      <StatCard 
        label="Overdue Todos" 
        value={overdueCount} 
        icon={AlertCircle} 
        accent="var(--c-redTexAccPri)" 
        bg="var(--c-redBacSec)" 
      />
      <StatCard 
        label="Team Members" 
        value={memberCount} 
        icon={Users} 
        accent="var(--c-yelTexAccPri)" 
        bg="var(--c-yelBacSec)" 
      />
    </div>
  );
}