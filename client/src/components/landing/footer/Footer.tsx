import { FOOTER_SECTIONS, SOCIAL_ICONS } from "@/lib/constants/landing";
import { Link } from "@tanstack/react-router";


export function Footer() {
  return (
    <footer style={{ borderTop: "1px solid var(--c-borPri)" }}>
      <div className="max-w-7xl mx-auto px-5 md:px-8 py-14">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-8 mb-12">
          {/* Brand */}
          <div className="col-span-2 sm:col-span-3 lg:col-span-2 flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <div
                style={{ backgroundColor: "var(--c-texPri)", color: "var(--c-bacPri)" }}
                className="w-6 h-6 rounded-md flex items-center justify-center font-bold text-xs"
              >
                T
              </div>
              <span style={{ color: "var(--c-texPri)" }} className="font-semibold text-sm">
                TaskHub
              </span>
            </div>
            <p style={{ color: "var(--c-texTer)" }} className="text-xs leading-relaxed max-w-[220px]">
              The connected workspace for docs, projects, and knowledge.
            </p>
            <div className="flex items-center gap-3">
              {SOCIAL_ICONS.map((Icon, i) => (
                <button
                  key={i}
                  style={{ color: "var(--c-texTer)" }}
                  className="hover:text-[var(--c-texSec)] transition-colors"
                >
                  <Icon size={16} />
                </button>
              ))}
            </div>
          </div>
          {/* Link columns */}
          {FOOTER_SECTIONS.map(({ title, links }) => (
            <div key={title} className="flex flex-col gap-3">
              <p
                style={{ color: "var(--c-texPri)" }}
                className="text-xs font-semibold uppercase tracking-widest"
              >
                {title}
              </p>
              <ul className="flex flex-col gap-2">
                {links.map((link) => (
                  <li key={link}>
                    <button
                      style={{ color: "var(--c-texTer)" }}
                      className="text-xs hover:text-[var(--c-texSec)] transition-colors"
                    >
                      {link}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        {/* Bottom bar */}
        <div
          style={{ borderTop: "1px solid var(--c-borPri)" }}
          className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3"
        >
          <p style={{ color: "var(--c-texTer)" }} className="text-xs">
            © 2025 TaskHub, Inc. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            {["Privacy Policy", "Terms of Service", "Cookie Policy"].map((item) => (
              <button
                key={item}
                style={{ color: "var(--c-texTer)" }}
                className="text-xs hover:text-[var(--c-texSec)] transition-colors"
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}