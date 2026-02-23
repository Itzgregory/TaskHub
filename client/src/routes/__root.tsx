import { createRootRoute, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";
import { Toaster } from "../components/ui/toaster";
import { Toaster as Sonner } from "../components/ui/sonner";
import { TooltipProvider } from "../components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StoreProvider } from "../lib/store";
import { ThemeProvider } from "../lib/theme-provider";
import { AuthProvider } from "../lib/auth/AuthContext";
import { AuthGuard } from "../components/auth/AuthGuard";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <StoreProvider>
          <ThemeProvider defaultTheme="light" storageKey="taskhub-theme">
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <AuthGuard>
                <Outlet />
              </AuthGuard>
              {import.meta.env.MODE === "development" && <TanStackRouterDevtools />}
            </TooltipProvider>
          </ThemeProvider>
        </StoreProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}