import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface FeatureCardProps {
  Icon: LucideIcon;
  title: string;
  desc: string;
}

export function FeatureCard({ Icon, title, desc }: FeatureCardProps) {
  return (
    <Card
      style={{
        backgroundColor: "var(--c-bacSec)",
        border: "1px solid var(--c-borPri)",
      }}
      className="p-6 flex flex-col gap-4 hover:shadow-[var(--c-shaSM)] transition-shadow group border"
    >
      <div
        style={{
          backgroundColor: "var(--c-bluBacSec)",
          color: "var(--c-bluTexAccPri)",
          width: 40,
          height: 40,
          borderRadius: 10,
        }}
        className="flex items-center justify-center shrink-0"
      >
        <Icon size={20} />
      </div>
      <CardContent className="p-0">
        <h3
          style={{ color: "var(--c-texPri)" }}
          className="font-semibold text-sm mb-2 leading-snug"
        >
          {title}
        </h3>
        <p style={{ color: "var(--c-texSec)" }} className="text-sm leading-relaxed">
          {desc}
        </p>
      </CardContent>
    </Card>
  );
}