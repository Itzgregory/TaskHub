import { NAV_LINKS } from "@/lib/constants/landing";
import { Link } from "@tanstack/react-router";
import { ChevronDown, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

interface NavbarProps {
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

export function Navbar({ mobileOpen, setMobileOpen }: NavbarProps) {
  return (
    <header
      style={{
        borderBottom: "1px solid var(--c-borPri)",
        backgroundColor: "var(--c-bacPri)",
      }}
      className="sticky top-0 z-50"
    >
      <div className="max-w-7xl mx-auto px-5 md:px-8 flex items-center justify-between h-14">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <div
            style={{
              backgroundColor: "var(--c-texPri)",
              color: "var(--c-bacPri)",
            }}
            className="w-7 h-7 rounded-md flex items-center justify-center font-bold text-sm select-none"
          >
            T
          </div>
          <span style={{ color: "var(--c-texPri)" }} className="font-semibold text-sm tracking-tight">
            TaskHub
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-1">
          {NAV_LINKS.map((label) => (
            <button
              key={label}
              style={{ color: "var(--c-texSec)" }}
              className="flex items-center gap-0.5 px-3 py-1.5 text-sm rounded-md hover:bg-[var(--c-bacTer)] transition-colors"
            >
              {label}
              {label === "Product" && <ChevronDown size={13} className="mt-0.5" />}
            </button>
          ))}
        </nav>

        {/* Desktop Auth */}
        <div className="hidden lg:flex items-center gap-2">
          <Link
            to="/auth/login"
            style={{ color: "var(--c-texSec)" }}
            className="px-3 py-1.5 text-sm rounded-md hover:bg-[var(--c-bacTer)] transition-colors whitespace-nowrap"
          >
            Log in
          </Link>
          <Link
            to="/auth/signup"
            style={{
              backgroundColor: "var(--c-bluBacAccPri)",
              color: "#fff",
            }}
            className="px-3 py-1.5 text-sm font-medium rounded-md hover:opacity-90 transition-opacity whitespace-nowrap"
          >
            Get TaskHub free
          </Link>
        </div>

        {/* Mobile menu using Sheet component */}
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild className="lg:hidden">
            <Button variant="ghost" size="icon" style={{ color: "var(--c-texSec)" }}>
              <Menu size={20} />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[300px] p-0" style={{ backgroundColor: "var(--c-bacPri)" }}>
            <div className="flex flex-col h-full">
              <div className="p-5 border-b" style={{ borderColor: "var(--c-borPri)" }}>
                <div className="flex items-center gap-2">
                  <div
                    style={{
                      backgroundColor: "var(--c-texPri)",
                      color: "var(--c-bacPri)",
                    }}
                    className="w-7 h-7 rounded-md flex items-center justify-center font-bold text-sm"
                  >
                    T
                  </div>
                  <span style={{ color: "var(--c-texPri)" }} className="font-semibold text-sm">
                    TaskHub
                  </span>
                </div>
              </div>
              <div className="flex-1 p-5 flex flex-col gap-1">
                {NAV_LINKS.map((label) => (
                  <button
                    key={label}
                    style={{ color: "var(--c-texSec)" }}
                    className="text-left px-3 py-2.5 text-sm rounded-md hover:bg-[var(--c-bacTer)]"
                  >
                    {label}
                  </button>
                ))}
                <div
                  style={{ borderTop: "1px solid var(--c-borPri)" }}
                  className="mt-2 pt-3 flex flex-col gap-2"
                >
                  <Link
                    to="/auth/login"
                    style={{ color: "var(--c-texSec)" }}
                    className="px-3 py-2 text-sm rounded-md hover:bg-[var(--c-bacTer)]"
                    onClick={() => setMobileOpen(false)}
                  >
                    Log in
                  </Link>
                  <Link
                    to="/auth/signup"
                    style={{ backgroundColor: "var(--c-bluBacAccPri)", color: "#fff" }}
                    className="px-3 py-2 text-sm font-medium rounded-md text-center"
                    onClick={() => setMobileOpen(false)}
                  >
                    Get TaskHub free
                  </Link>
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}