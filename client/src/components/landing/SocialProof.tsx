import { COMPANIES } from "@/lib/constants/landing";

export function SocialProof() {
  return (
    <section
      style={{ borderTop: "1px solid var(--c-borPri)", borderBottom: "1px solid var(--c-borPri)" }}
      className="py-12"
    >
      <div className="max-w-7xl mx-auto px-5 md:px-8">
        <p
          style={{ color: "var(--c-texTer)" }}
          className="text-center text-xs font-medium uppercase tracking-widest mb-8"
        >
          Trusted by teams at the world's best companies
        </p>
        <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12 lg:gap-16">
          {COMPANIES.map((name) => (
            <span
              key={name}
              style={{ color: "var(--c-texDis)" }}
              className="text-sm font-bold tracking-tight uppercase opacity-60 hover:opacity-100 transition-opacity cursor-default select-none"
            >
              {name}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}