"use client";

import { useState, useEffect } from "react";
import { ContractRequestForm } from "@/components/contract-request-form";
import { ContractPreview } from "@/components/contract-preview";
import { PolicyCheck } from "@/components/policy-check";
import { ExecutionStatus } from "@/components/execution-status";
import { ExecutionHistory } from "@/components/execution-history";
import { WalletStatus } from "@/components/wallet-status";
import { TestnetBanner } from "@/components/testnet-banner";
import { OfflineModeBanner } from "@/components/offline-mode-banner";
import { SystemStatus } from "@/components/system-status";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { usePiWallet } from "@/hooks/use-pi-wallet";
import type { ContractRequest, PolicyCheckResult, ExecutionLog } from "@/lib/types";
import { Shield, History as HistoryIcon } from "lucide-react";
import { APP_CONFIG } from "@/lib/app-config";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

type Step = "form" | "preview" | "policy" | "execution";
type Page = "home" | "activity";

export default function Home() {
  const [page, setPage] = useState<Page>("home");
  const [step, setStep] = useState<Step>("form");
  const [currentRequest, setCurrentRequest] = useState<Partial<ContractRequest>>({});
  const { logs: executionLogs, addLog, isLoaded } = useLocalStorage();
  const { isConnected } = usePiWallet();

  useEffect(() => {
    document.title = "Made with App Studio";
  }, []);

  // Show loading state while initializing
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="flex items-center justify-center">
            <Shield className="h-12 w-12 text-primary animate-pulse" />
          </div>
          <p className="text-sm text-muted-foreground">Initializing SmartContract Control Gate...</p>
        </div>
      </div>
    );
  }

  const handleFormSubmit = (request: Partial<ContractRequest>) => {
    setCurrentRequest(request);
    setStep("preview");
  };

  const handlePreviewBack = () => {
    setStep("form");
  };

  const handlePreviewProceed = () => {
    setStep("policy");
  };

  const handlePolicyComplete = (result: PolicyCheckResult) => {
    const referenceId = `REF-${Date.now()}-${Math.random().toString(36).substring(7).toUpperCase()}`;
    
    const fullRequest: ContractRequest = {
      ...currentRequest,
      id: Math.random().toString(36).substring(7),
      referenceId,
      status: "approved",
      timestamp: new Date(),
      policyCheckResult: result,
    } as ContractRequest;

    setCurrentRequest(fullRequest);
    setStep("execution");
  };

  const handleExecutionComplete = (log: ExecutionLog) => {
    addLog(log);
  };

  const handleReset = () => {
    setCurrentRequest({});
    setStep("form");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/30 backdrop-blur sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            <button 
              onClick={() => { setPage("home"); setStep("form"); }}
              className="flex items-center gap-3 hover:opacity-80 transition-opacity"
            >
              <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-primary/10 border border-primary/20">
                <Shield className="h-5 w-5 text-primary" />
              </div>
              <div className="text-left">
                <h1 className="text-base font-semibold leading-tight">
                  {APP_CONFIG.NAME}
                </h1>
                <p className="text-xs text-muted-foreground">
                  {APP_CONFIG.DOMAIN}
                </p>
              </div>
            </button>
            <div className="flex items-center gap-2">
              <WalletStatus />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setPage(page === "home" ? "activity" : "home")}
                className="h-8 px-2"
              >
                <HistoryIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 max-w-2xl">
        <TestnetBanner />
        <OfflineModeBanner />

        {page === "home" && (
          <div className="space-y-6">
            {/* Step Indicator */}
            <div className="flex items-center justify-center gap-2">
              {["form", "preview", "policy", "execution"].map((s, index) => (
                <div key={s} className="flex items-center">
                  <div
                    className={`h-2 w-2 rounded-full transition-colors ${
                      step === s
                        ? "bg-primary"
                        : ["form", "preview", "policy", "execution"].indexOf(step) > index
                        ? "bg-primary/50"
                        : "bg-muted"
                    }`}
                  />
                  {index < 3 && (
                    <div
                      className={`h-0.5 w-8 mx-1 transition-colors ${
                        ["form", "preview", "policy", "execution"].indexOf(step) > index
                          ? "bg-primary/50"
                          : "bg-muted"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>

            {/* Current Step */}
            {step === "form" && (
              <ContractRequestForm onSubmit={handleFormSubmit} />
            )}

            {step === "preview" && (
              <ContractPreview
                request={currentRequest}
                onBack={handlePreviewBack}
                onProceed={handlePreviewProceed}
              />
            )}

            {step === "policy" && (
              <>
                {!isConnected && (
                  <Alert variant="destructive" className="mb-4">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      Pi Wallet must be connected before executing transactions. Please connect your wallet using the button in the header.
                    </AlertDescription>
                  </Alert>
                )}
                <PolicyCheck
                  request={currentRequest}
                  onComplete={handlePolicyComplete}
                  walletConnected={isConnected}
                />
              </>
            )}

            {step === "execution" && (
              <ExecutionStatus
                request={currentRequest as ContractRequest}
                onComplete={handleExecutionComplete}
                onReset={handleReset}
              />
            )}
          </div>
        )}

        {page === "activity" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-balance">Activity Log</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  All contract execution history on Pi Testnet
                </p>
              </div>
            </div>
            
            {executionLogs.length > 0 ? (
              <ExecutionHistory logs={executionLogs} />
            ) : (
              <div className="text-center py-12">
                <HistoryIcon className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
                <p className="text-sm text-muted-foreground">No activity yet</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Execute your first contract to see activity here
                </p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => setPage("home")}
                >
                  Create Request
                </Button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 mt-12 py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center gap-3">
            <SystemStatus />
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Unified Build System • Core Engine • Action Configuration
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Expandable architecture without structural changes
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
