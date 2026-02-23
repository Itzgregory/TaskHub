import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Building2, Plus, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useAuth } from "@/lib/auth/AuthContext";
import { useCreateOrganisation, useSetActiveOrg } from "@/lib/api/hooks";
import { EmptyState } from "@/components/features/EmptyState";
import { toast } from "@/lib/hooks/use-toast";

export default function OrganisationSelectionPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newOrgName, setNewOrgName] = useState("");
  const navigate = useNavigate();
  const { organisations, setActiveOrg } = useAuth();
  const createOrgMutation = useCreateOrganisation();
  const setActiveOrgMutation = useSetActiveOrg();
  const isLoading = createOrgMutation.isPending;

  const handleSelectOrg = async (orgId: string) => {
    console.log("Selected orgId:", orgId);
    const org = organisations.find(o => o.orgId === orgId);
    if (!org) return;

    // Update backend active org + local context
    await setActiveOrgMutation.mutateAsync({ orgId });
    setActiveOrg(org);
    navigate({ to: "/dashboard/org/home" });
    toast({
      title: "Welcome! to TaskHub for " + org.orgName,
      description: "Your organisation has been set up successfully.",
    });
  };

  const handleCreateOrg = async () => {
    if (!newOrgName.trim()) return;

    try {
      const created = await createOrgMutation.mutateAsync({ name: newOrgName.trim() });
      setNewOrgName("");
      setIsCreateModalOpen(false);

      // After creating, mark it active locally & via API
      await setActiveOrgMutation.mutateAsync({ orgId: created.id });
      const newOrg = {
        orgId: created.id,
        orgName: created.name,
        role: "OrgAdmin" as const,
        joinedAt: new Date().toISOString(),
      };
      setActiveOrg(newOrg);
      navigate({ to: "/dashboard/org/home" });
    } catch {
      // Errors are surfaced via toasts by hooks/caller if desired
    }
  };

  const handleSkip = () => {
    navigate({ to: "/dashboard/org/home" });
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 py-8"
      style={{ backgroundColor: "var(--c-bacPri)" }}
    >
      <Card
        className="w-full max-w-md border"
        style={{
          backgroundColor: "var(--c-bacEle)",
          boxShadow: "var(--c-shaMD)",
          borderColor: "var(--c-borPri)",
        }}
      >
        <CardHeader className="space-y-4">
          <div className="flex justify-center">
            <div className="flex items-center gap-2">
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: "var(--c-bluBacAccPri)" }}
              >
                <Building2 className="w-4 h-4" style={{ color: "#fff" }} />
              </div>
              <span
                className="text-base"
                style={{ fontFamily: "'Permanent Marker', cursive", color: "var(--c-texPri)" }}
              >
                TaskHub
              </span>
            </div>
          </div>

          <div className="text-center">
            <h1 className="text-xl font-semibold" style={{ color: "var(--c-texPri)" }}>
              Choose your workspace
            </h1>
            <p className="text-sm mt-1" style={{ color: "var(--c-texSec)" }}>
              Select an organisation or work personally
            </p>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {organisations.length > 0 ? (
            <div className="space-y-3">
              <p className="text-xs font-medium uppercase tracking-wider" style={{ color: "var(--c-texTer)" }}>
                Your organisations
              </p>
              <div className="space-y-2">
                {organisations.map((org) => (
                  <button
                    key={org.orgId}
                    onClick={() => handleSelectOrg(org.orgId)}
                    className="w-full flex items-center justify-between p-3 rounded-xl text-left transition-all hover:scale-[1.02]"
                    style={{
                      backgroundColor: "var(--c-bacSec)",
                      border: "1px solid var(--c-borPri)",
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: "var(--c-bacTer)" }}
                      >
                        <Building2 className="w-4 h-4" style={{ color: "var(--c-icoSec)" }} />
                      </div>
                      <div>
                        <p className="text-sm font-medium" style={{ color: "var(--c-texPri)" }}>
                          {org.orgName}
                        </p>
                        <span
                          className="text-xs px-2 py-0.5 rounded-full"
                          style={{
                            backgroundColor:
                              org.role === "OrgAdmin" ? "var(--c-bluBacSec)" : "var(--c-bacTer)",
                            color: org.role === "OrgAdmin" ? "var(--c-bluTexAccPri)" : "var(--c-texSec)",
                          }}
                        >
                          {org.role}
                        </span>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4" style={{ color: "var(--c-icoSec)" }} />
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <EmptyState
              icon={<Building2 className="w-8 h-8" style={{ color: "var(--c-icoSec)" }} />}
              title="No organisations yet"
              description="Create one to start collaborating"
            />
          )}

          <div className="space-y-3 pt-2">
            <Button
              onClick={() => setIsCreateModalOpen(true)}
              className="w-full flex items-center justify-center gap-2 h-10"
              style={{
                backgroundColor: "var(--c-bluBacAccPri)",
                color: "#fff",
              }}
            >
              <Plus className="w-4 h-4" />
              Create New Organisation
            </Button>


          </div>
        </CardContent>
      </Card>

      {/* Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent
          style={{
            backgroundColor: "var(--c-bacPri)",
            borderColor: "var(--c-borPri)",
            boxShadow: "var(--c-froDiaSha)",
          }}
        >
          <DialogHeader>
            <DialogTitle style={{ color: "var(--c-texPri)" }}>
              Create new organisation
            </DialogTitle>
          </DialogHeader>

          <div className="py-4">
            <Input
              placeholder="Organisation name"
              value={newOrgName}
              onChange={(e) => setNewOrgName(e.target.value)}
              className="w-full"
              style={{
                backgroundColor: "var(--c-bacSec)",
                borderColor: "var(--c-borPri)",
                color: "var(--c-texPri)",
              }}
              autoFocus
            />
          </div>

          <DialogFooter className="flex gap-2">
            <Button
              variant="ghost"
              onClick={() => setIsCreateModalOpen(false)}
              style={{ color: "var(--c-texSec)" }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateOrg}
              disabled={!newOrgName.trim() || isLoading}
              style={{
                backgroundColor: "var(--c-bluBacAccPri)",
                color: "#fff",
                opacity: !newOrgName.trim() || isLoading ? 0.5 : 1,
              }}
            >
              {isLoading ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}