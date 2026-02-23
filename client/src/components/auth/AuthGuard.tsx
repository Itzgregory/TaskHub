import { useAuth } from "@/lib/auth/AuthContext";
import { useLocation, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

/**
 * Protects /dashboard routes — redirects to /auth/login if no user session.
 * Wrap around <Outlet /> in the root component.
 */
export function AuthGuard({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    const isDashboardRoute = location.pathname.startsWith("/dashboard");

    useEffect(() => {
        if (isDashboardRoute && !user) {
            navigate({ to: "/auth/login", replace: true });
        }
    }, [isDashboardRoute, user, navigate]);

    // While redirecting, render nothing to avoid flash
    if (isDashboardRoute && !user) {
        return null;
    }

    return <>{children}</>;
}
