import { Link } from "@tanstack/react-router";
import { ArrowRight, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

export function FinalCTA() {
  return (
    <section className="py-28">
      <div className="max-w-2xl mx-auto px-5 md:px-8 text-center flex flex-col items-center gap-6">
        <div
          style={{
            backgroundColor: "var(--c-texPri)",
            color: "var(--c-bacPri)",
          }}
          className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg"
        >
          T
        </div>
        <h2
          style={{ color: "var(--c-texPri)" }}
          className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight leading-tight"
        >
          Get started for free.
        </h2>
        <p style={{ color: "var(--c-texSec)" }} className="text-lg max-w-md">
          Join millions of teams who use TaskHub to do their best work. No credit card required.
        </p>
        <div className="flex flex-col sm:flex-row items-center gap-3 mt-2">
          <Link
            to="/auth/signup"
            style={{ backgroundColor: "var(--c-bluBacAccPri)", color: "#fff" }}
            className="inline-flex items-center gap-2 px-6 py-3.5 text-sm font-semibold rounded-lg hover:opacity-90 transition-opacity"
          >
            Get TaskHub free
            <ArrowRight size={16} />
          </Link>
          <Button
            variant="outline"
            style={{
              borderColor: "var(--c-borPri)",
              color: "var(--c-texSec)",
              backgroundColor: "var(--c-bacPri)",
            }}
            className="inline-flex items-center gap-2 px-6 py-3.5 text-sm font-medium"
          >
            <BookOpen size={15} />
            Request a demo
          </Button>
        </div>
        <p style={{ color: "var(--c-texTer)" }} className="text-xs">
          Free forever · No credit card · Cancel anytime
        </p>
      </div>
    </section>
  );
}