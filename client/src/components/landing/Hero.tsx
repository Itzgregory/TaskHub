import { Link } from "@tanstack/react-router";
import { Star, ArrowRight, CheckSquare } from "lucide-react";
import heroDashboard from "/assets/hero-image.png";
import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section className="max-w-7xl mx-auto px-5 md:px-8 pt-20 pb-16 md:pt-28 md:pb-24">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        {/* Left: Text */}
        <div className="flex flex-col gap-6">
          <div
            style={{
              color: "var(--c-bluTexAccPri)",
              backgroundColor: "var(--c-bluBacPri)",
              border: "1px solid var(--c-bluBorPri)",
            }}
            className="inline-flex self-start items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium"
          >
            <Star size={12} />
            Trusted by 4 million+ teams worldwide
          </div>
          <h1
            style={{ color: "var(--c-texPri)", lineHeight: "1.1" }}
            className="text-4xl sm:text-5xl lg:text-[56px] font-bold tracking-tight"
          >
            The connected workspace your team{" "}
            <span style={{ color: "var(--c-bluTexAccPri)" }}>actually</span> loves.
          </h1>
          <p
            style={{ color: "var(--c-texSec)", lineHeight: "1.6" }}
            className="text-lg sm:text-xl max-w-lg"
          >
            One tool for your whole company to write, plan, and organize — from solo projects to enterprise teams.
          </p>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <Link
              to="/auth/signup"
              style={{ backgroundColor: "var(--c-bluBacAccPri)", color: "#fff" }}
              className="inline-flex items-center gap-2 px-5 py-3 text-sm font-semibold rounded-lg hover:opacity-90 transition-opacity"
            >
              Get TaskHub free
              <ArrowRight size={16} />
            </Link>
            <Button
              variant="link"
              style={{ color: "var(--c-texSec)" }}
              className="text-sm underline underline-offset-4"
            >
              Request a demo
            </Button>
          </div>
          <p style={{ color: "var(--c-texTer)" }} className="text-xs">
            No credit card required · Free forever for individuals
          </p>
        </div>

        {/* Right: Dashboard Visual */}
        <div className="relative">
          <div
            style={{
              borderRadius: "16px",
              border: "1px solid var(--c-borPri)",
              boxShadow: "var(--c-shaLG)",
              overflow: "hidden",
            }}
          >
            <img
              src={heroDashboard}
              alt="TaskHub dashboard preview"
              className="w-full block"
              loading="lazy"
            />
          </div>
          {/* Floating badge */}
          <div
            style={{
              backgroundColor: "var(--c-bacPri)",
              border: "1px solid var(--c-borPri)",
              boxShadow: "var(--c-shaMD)",
            }}
            className="absolute -bottom-4 -left-4 hidden sm:flex items-center gap-3 px-4 py-3 rounded-xl"
          >
            <div
              style={{ backgroundColor: "var(--c-greBacSec)" }}
              className="w-8 h-8 rounded-full flex items-center justify-center"
            >
              <CheckSquare size={16} style={{ color: "var(--c-greTexAccPri)" }} />
            </div>
            <div>
              <p style={{ color: "var(--c-texPri)" }} className="text-xs font-semibold">
                12 tasks completed today
              </p>
              <p style={{ color: "var(--c-texTer)" }} className="text-xs">
                Team is 94% on track
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}