import { FEATURES } from "@/lib/constants/landing";
import { FeatureCard } from "./FeatureCard";

export function FeatureGrid() {
  return (
    <section className="max-w-7xl mx-auto px-5 md:px-8 py-24">
      <div className="text-center mb-16 max-w-2xl mx-auto">
        <p
          style={{ color: "var(--c-bluTexAccPri)" }}
          className="text-xs font-semibold uppercase tracking-widest mb-3"
        >
          Everything in one place
        </p>
        <h2
          style={{ color: "var(--c-texPri)" }}
          className="text-3xl sm:text-4xl font-bold tracking-tight mb-4"
        >
          Replace every tool in your stack
        </h2>
        <p style={{ color: "var(--c-texSec)" }} className="text-lg leading-relaxed">
          TaskHub consolidates your docs, wikis, tasks, and databases into a single, powerful workspace.
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {FEATURES.map((feature) => (
          <FeatureCard key={feature.title} {...feature} />
        ))}
      </div>
    </section>
  );
}