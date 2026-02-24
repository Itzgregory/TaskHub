import { useCallback, useMemo } from "react";
import { useAuth } from "@/lib/auth/AuthContext";

export function useProjects() {
    const { organisations } = useAuth();

    const projects = useMemo(
        () =>
            organisations.map(org => ({
                id: org.orgId,
                name: org.orgName,
                status: "active" as const,
                joinedAt: new Date(org.joinedAt).toLocaleDateString(),
            })),
        [organisations]
    );

    const filteredProjects = useCallback(
        (search: string) => {
            return projects.filter(p => {
                if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
                return true;
            });
        },
        [projects]
    );

    return {
        projects,
        filteredProjects,
    };
}