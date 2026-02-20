import { useState } from "react";
import { Search, X, PanelLeft, Menu } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";

interface HeaderProps {
  title: string;
  subtitle?: string;
  onSidebarToggle: () => void;
  isMobile?: boolean;
  mobileMenuOpen?: boolean;
}

export function Header({ 
  title, 
  subtitle, 
  onSidebarToggle,
  isMobile,
  mobileMenuOpen 
}: HeaderProps) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
        navigate({
            to: "/dashboard/search",
            search: () => ({ query: query.trim() })
        });
      setSearchOpen(false);
      setQuery("");
    }
  };

  return (
    <header
      className="sticky top-0 z-30 flex items-center gap-3 px-4 sm:px-6 py-4"
      style={{
        borderBottom: "1px solid var(--c-borPri)",
        backgroundColor: "var(--c-bacPri)",
      }}
    >
      {/* Sidebar toggle - different icons for mobile/desktop */}
      <button
        onClick={onSidebarToggle}
        className="p-1.5 rounded-lg transition-colors"
        style={{ color: "var(--c-texSec)" }}
        onMouseOver={e => (e.currentTarget.style.backgroundColor = "var(--c-bacTer)")}
        onMouseOut={e => (e.currentTarget.style.backgroundColor = "")}
        aria-label={isMobile 
          ? (mobileMenuOpen ? "Close menu" : "Open menu") 
          : "Toggle sidebar"
        }
      >
        {isMobile ? (
          <Menu className="w-5 h-5" />
        ) : (
          <PanelLeft className="w-4 h-4" />
        )}
      </button>

      {/* Title */}
      <div className="flex-1">
        <h1
          className="text-base font-semibold leading-none"
          style={{ color: "var(--c-texPri)" }}
        >
          {title}
        </h1>
        {subtitle && (
          <p className="text-xs mt-0.5" style={{ color: "var(--c-texTer)" }}>
            {subtitle}
          </p>
        )}
      </div>

      {/* Search - unchanged */}
      <div className="flex items-center gap-2">
        {searchOpen ? (
          <form onSubmit={handleSearch} className="flex items-center">
            <div
              className="flex items-center gap-2 rounded-lg px-3 py-1.5 animate-scale-in"
              style={{
                backgroundColor: "var(--c-bacTer)",
                border: "1px solid var(--c-borSec)",
              }}
            >
              <Search className="w-3.5 h-3.5" style={{ color: "var(--c-texTer)" }} />
              <input
                autoFocus
                type="text"
                placeholder="Search tasks..."
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={e => e.key === "Escape" && setSearchOpen(false)}
                className="bg-transparent text-sm outline-none w-32 sm:w-48"
                style={{ color: "var(--c-texPri)" }}
              />
              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                style={{ color: "var(--c-texTer)" }}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        ) : (
          <button
            onClick={() => setSearchOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors"
            style={{
              color: "var(--c-texTer)",
              border: "1px solid var(--c-borPri)",
              backgroundColor: "transparent",
            }}
            onMouseOver={e => (e.currentTarget.style.backgroundColor = "var(--c-bacTer)")}
            onMouseOut={e => (e.currentTarget.style.backgroundColor = "transparent")}
          >
            <Search className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Search</span>
            <kbd
              className="hidden sm:inline text-[10px] font-mono px-1 py-0.5 rounded"
              style={{ backgroundColor: "var(--c-bacTer)", color: "var(--c-texDis)" }}
            >
              ⌘K
            </kbd>
          </button>
        )}
      </div>
    </header>
  );
}