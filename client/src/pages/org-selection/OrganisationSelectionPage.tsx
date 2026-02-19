import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Building2, Plus, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

// Mock data
const MOCK_ORGANISATIONS = [
  { id: "1", name: "Acme Inc", role: "Owner" },
  { id: "2", name: "Beta LLC", role: "Member" },
];

export default function OrganisationSelectionPage() {
  const [organisations, setOrganisations] = useState(MOCK_ORGANISATIONS);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newOrgName, setNewOrgName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSelectOrg = (orgId: string) => {
    // Set active org in context/store
    navigate({ to: "/dashboard/today" });
  };

  const handleCreateOrg = () => {
    if (!newOrgName.trim()) return;
    
    setIsLoading(true);
    setTimeout(() => {
      const newOrg = {
        id: String(organisations.length + 1),
        name: newOrgName,
        role: "Owner",
      };
      setOrganisations([...organisations, newOrg]);
      setNewOrgName("");
      setIsCreateModalOpen(false);
      setIsLoading(false);
      navigate({ to: "/dashboard/today" });
    }, 1000);
  };

  const handleSkip = () => {
    navigate({ to: "/dashboard/today" });
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
                    key={org.id}
                    onClick={() => handleSelectOrg(org.id)}
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
                          {org.name}
                        </p>
                        <span
                          className="text-xs px-2 py-0.5 rounded-full"
                          style={{
                            backgroundColor: 
                              org.role === "Owner" ? "var(--c-bluBacSec)" : "var(--c-bacTer)",
                            color: org.role === "Owner" ? "var(--c-bluTexAccPri)" : "var(--c-texSec)",
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
            <div className="text-center py-8 space-y-4">
              <div
                className="w-16 h-16 rounded-full mx-auto flex items-center justify-center"
                style={{ backgroundColor: "var(--c-bacTer)" }}
              >
                <Building2 className="w-8 h-8" style={{ color: "var(--c-icoSec)" }} />
              </div>
              <div>
                <p className="text-sm font-medium" style={{ color: "var(--c-texPri)" }}>
                  No organisations yet
                </p>
                <p className="text-xs mt-1" style={{ color: "var(--c-texSec)" }}>
                  Create one to start collaborating
                </p>
              </div>
            </div>
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

            <button
              onClick={handleSkip}
              className="w-full text-sm py-2 transition-opacity hover:opacity-80"
              style={{ color: "var(--c-texSec)" }}
            >
              Skip to personal workspace →
            </button>
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