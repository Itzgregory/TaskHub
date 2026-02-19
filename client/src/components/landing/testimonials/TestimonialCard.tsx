import { Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface TestimonialCardProps {
  quote: string;
  name: string;
  role: string;
  initials: string;
}

export function TestimonialCard({ quote, name, role, initials }: TestimonialCardProps) {
  return (
    <Card
      style={{
        backgroundColor: "var(--c-bacSec)",
        border: "1px solid var(--c-borPri)",
      }}
      className="p-6 flex flex-col gap-5 border"
    >
      <div className="flex gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star key={i} size={13} style={{ color: "#f59e0b" }} fill="#f59e0b" />
        ))}
      </div>
      <p style={{ color: "var(--c-texSec)", lineHeight: 1.6 }} className="text-sm flex-1">
        "{quote}"
      </p>
      <div className="flex items-center gap-3 pt-2" style={{ borderTop: "1px solid var(--c-borPri)" }}>
        <Avatar>
          <AvatarFallback
            style={{
              backgroundColor: "var(--c-bluBacSec)",
              color: "var(--c-bluTexAccPri)",
            }}
          >
            {initials}
          </AvatarFallback>
        </Avatar>
        <div>
          <p style={{ color: "var(--c-texPri)" }} className="text-sm font-semibold">
            {name}
          </p>
          <p style={{ color: "var(--c-texTer)" }} className="text-xs">
            {role}
          </p>
        </div>
      </div>
    </Card>
  );
}