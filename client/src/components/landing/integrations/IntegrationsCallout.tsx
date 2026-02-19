import { Link } from "@tanstack/react-router";
import { ArrowRight, CheckSquare } from "lucide-react";
import { IntegrationIconGrid } from "./IntegrationIconGrid";
import { Button } from "@/components/ui/button";
import { INTEGRATION_BULLETS } from "@/lib/constants/landing";

export function IntegrationsCallout() {
  return (
    <section
      style={{ 
        backgroundColor: "var(--c-bacSec)", 
        borderTop: "1px solid var(--c-borPri)", 
        borderBottom: "1px solid var(--c-borPri)" 
      }}
      className="py-24"
    >
      <div className="max-w-7xl mx-auto px-5 md:px-8 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        {/* Text */}
        <div className="flex flex-col gap-5">
          <p
            style={{ color: "var(--c-bluTexAccPri)" }}
            className="text-xs font-semibold uppercase tracking-widest"
          >
            Integrations
          </p>
          <h2
            style={{ color: "var(--c-texPri)" }}
            className="text-3xl sm:text-4xl font-bold tracking-tight leading-tight"
          >
            Connect the tools you already use.
          </h2>
          <p style={{ color: "var(--c-texSec)" }} className="text-base leading-relaxed">
            TaskHub works with the tools you love. Connect Slack, GitHub, Google Drive, and more to bring all your work into one place — no switching tabs, no lost context.
          </p>
          <ul className="flex flex-col gap-3">
            {INTEGRATION_BULLETS.map((item) => (
              <li key={item} className="flex items-start gap-2.5">
                <CheckSquare
                  size={16}
                  style={{ color: "var(--c-greTexAccPri)", marginTop: 2, flexShrink: 0 }}
                />
                <span style={{ color: "var(--c-texSec)" }} className="text-sm">
                  {item}
                </span>
              </li>
            ))}
          </ul>
          <Button
            variant="link"
            asChild
            className="p-0 h-auto self-start"
            style={{ color: "var(--c-bluTexAccPri)" }}
          >
            <Link to="/auth/signup" className="inline-flex items-center gap-1.5 text-sm font-medium">
              Explore all integrations <ArrowRight size={14} />
            </Link>
          </Button>
        </div>
        {/* Integration grid */}
        <IntegrationIconGrid />
      </div>
    </section>
  );
}