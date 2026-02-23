import { Link, type LinkProps } from "@tanstack/react-router";
import { forwardRef } from "react";
import { cn } from "../lib/utils/clsx";

interface NavLinkCompatProps
  extends Omit<LinkProps, "activeProps">,
  Pick<React.HTMLAttributes<HTMLAnchorElement>, "className" | "style"> {
  activeClassName?: string;
}

const NavLink = forwardRef<HTMLAnchorElement, NavLinkCompatProps>(
  ({ className, activeClassName, children, ...props }, ref) => {
    return (
      <Link
        ref={ref}
        className={className}
        activeProps={{
          className: cn(className, activeClassName),
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