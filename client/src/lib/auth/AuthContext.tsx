/**
 * Authentication context for managing user session
 */

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useMyOrganisations } from '../api/hooks';
import type { OrgMembershipDto } from '../api/types';

interface AuthUser {
  userId: string;
  email: string;
  onboardingCompleted: boolean;
}

interface AuthContextValue {
  user: AuthUser | null;
  activeOrg: OrgMembershipDto | null;
  organisations: OrgMembershipDto[];
  isLoading: boolean;
  setUser: (user: AuthUser | null) => void;
  setActiveOrg: (org: OrgMembershipDto | null) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const AUTH_STORAGE_KEY = 'taskhub_auth';
const ACTIVE_ORG_STORAGE_KEY = 'taskhub_active_org';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = useState<AuthUser | null>(() => {
    // Load from localStorage on mount
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [activeOrg, setActiveOrgState] = useState<OrgMembershipDto | null>(() => {
    try {
      const stored = localStorage.getItem(ACTIVE_ORG_STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [hasExplicitlySetOrg, setHasExplicitlySetOrg] = useState(false);

  const navigate = useNavigate();
  const { data: orgsData, isLoading: orgsLoading } = useMyOrganisations({
    enabled: !!user,
  });

  const organisations = useMemo(
    () => orgsData?.organisations || [],
    [orgsData]
  );

  // Sync active org with organisations list
  useEffect(() => {
    if (organisations.length > 0 && !activeOrg && !hasExplicitlySetOrg) {
      // Set first org as active if none selected and user hasn't explicitly cleared it
      setActiveOrgState(organisations[0]);
      localStorage.setItem(ACTIVE_ORG_STORAGE_KEY, JSON.stringify(organisations[0]));
    } else if (activeOrg && organisations.length > 0) {
      // Update active org if it exists in the list (keeps role in sync)
      const updated = organisations.find(o => o.orgId === activeOrg.orgId);
      if (updated) {
        setActiveOrgState(updated);
        localStorage.setItem(ACTIVE_ORG_STORAGE_KEY, JSON.stringify(updated));
      } else {
        // Stale org from localStorage — not in current list. Fall back to first org.
        setActiveOrgState(organisations[0]);
        localStorage.setItem(ACTIVE_ORG_STORAGE_KEY, JSON.stringify(organisations[0]));
      }
    }
  }, [organisations, activeOrg, hasExplicitlySetOrg]);

  const setUser = useCallback((newUser: AuthUser | null) => {
    setUserState(newUser);
    if (newUser) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(newUser));
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      localStorage.removeItem(ACTIVE_ORG_STORAGE_KEY);
      setActiveOrgState(null);
      setHasExplicitlySetOrg(false);
    }
  }, []);

  const setActiveOrg = useCallback((org: OrgMembershipDto | null) => {
    setActiveOrgState(org);
    setHasExplicitlySetOrg(true); // User made an explicit choice
    if (org) {
      localStorage.setItem(ACTIVE_ORG_STORAGE_KEY, JSON.stringify(org));
    } else {
      localStorage.removeItem(ACTIVE_ORG_STORAGE_KEY);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      const { authApi } = await import('../api/services');
      await authApi.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      navigate({ to: '/auth/login' });
    }
  }, [navigate, setUser]);

  return (
    <AuthContext.Provider
      value={{
        user,
        activeOrg,
        organisations,
        isLoading: orgsLoading,
        setUser,
        setActiveOrg,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
