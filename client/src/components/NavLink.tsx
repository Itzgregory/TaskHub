import { Link } from "@tanstack/react-router";
import { forwardRef } from "react";
import { cn } from "../lib/utils";

interface NavLinkCompatProps {
  className?: string;
  activeClassName?: string;
  pendingClassName?: string;
  to: string; 
  params?: Record<string, string>;
  children?: React.ReactNode;
  [key: string]: any;
}

const NavLink = forwardRef<HTMLAnchorElement, NavLinkCompatProps>(
  ({ className, activeClassName, pendingClassName, to, params, children, ...props }, ref) => {
    return (
      <Link
        ref={ref}
        // Cast to any to bypass type checking (use with caution)
        to={to as any}
        params={params}
        className={className}
        activeProps={{
          className: cn(className, activeClassName)
        }}
        {...props}
      >
        {children}
      </Link>
    );
  },
);

NavLink.displayName = "NavLink";

export { NavLink };