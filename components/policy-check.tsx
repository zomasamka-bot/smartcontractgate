"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import type { ContractRequest, PolicyCheckResult } from "@/lib/types";
import { Shield, CheckCircle, XCircle, Loader2, Send } from "lucide-react";

interface PolicyCheckProps {
  request: Partial<ContractRequest>;
  onComplete: (result: PolicyCheckResult) => void;
  walletConnected?: boolean;
}

export function PolicyCheck({ request, onComplete, walletConnected = true }: PolicyCheckProps) {
  const [checking, setChecking] = useState(true);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<PolicyCheckResult | null>(null);

  useEffect(() => {
    // Simulate policy checks
    const checks = [
      { name: "Contract Address Validation", delay: 800 },
      { name: "Method Whitelist Check", delay: 1200 },
      { name: "Parameter Format Validation", delay: 1000 },
      { name: "Gas Limit Estimation", delay: 900 },
    ];

    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += 25;
      setProgress(currentProgress);

      if (currentProgress >= 100) {
        clearInterval(interval);
        
        // Run actual policy checks
        const policyResult = runPolicyChecks(request);
        setResult(policyResult);
        setChecking(false);
      }
    }, 800);

    return () => clearInterval(interval);
  }, [request]);

  const runPolicyChecks = (req: Partial<ContractRequest>): PolicyCheckResult => {
    const checks = [];

    // Check 1: Contract address format
    const addressValid = req.contractAddress?.startsWith("0x") && req.contractAddress.length === 42;
    checks.push({
      name: "Contract Address Format",
      passed: addressValid,
      message: addressValid ? "Valid contract address format" : "Invalid address format",
    });

    // Check 2: Method name validation
    const methodValid = req.method && req.method.length > 0 && /^[a-zA-Z][a-zA-Z0-9]*$/.test(req.method);
    checks.push({
      name: "Method Name Validation",
      passed: methodValid,
      message: methodValid ? "Method name is valid" : "Invalid method name format",
    });

    // Check 3: Parameters validation
    let paramsValid = false;
    try {
      JSON.parse(req.parameters || "{}");
      paramsValid = true;
    } catch {
      paramsValid = false;
    }
    checks.push({
      name: "Parameters Format",
      passed: paramsValid,
      message: paramsValid ? "Parameters are valid JSON" : "Invalid JSON format",
    });

    // Check 4: Reason provided
    const reasonValid = req.reason && req.reason.length >= 10;
    checks.push({
      name: "Reason Validation",
      passed: reasonValid,
      message: reasonValid ? "Sufficient reason provided" : "Reason too short",
    });

    const allPassed = checks.every((c) => c.passed);

    return {
      passed: allPassed,
      checks,
      timestamp: new Date(),
    };
  };

  const handleProceed = () => {
    if (result) {
      onComplete(result);
    }
  };

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          <CardTitle>Policy Check</CardTitle>
        </div>
        <CardDescription>
          Running security and compliance validations
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {checking && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
              <span className="text-sm text-muted-foreground">
                Processing checks...
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}

        {!checking && result && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              {result.passed ? (
                <>
                  <CheckCircle className="h-5 w-5 text-primary" />
                  <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                    All Checks Passed
                  </Badge>
                </>
              ) : (
                <>
                  <XCircle className="h-5 w-5 text-destructive" />
                  <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20">
                    Policy Violations Detected
                  </Badge>
                </>
              )}
            </div>

            <div className="space-y-2">
              {result.checks.map((check, index) => (
                <div
                  key={index}
                  className="flex items-start gap-2 p-3 rounded-md bg-secondary/50"
                >
                  {check.passed ? (
                    <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  ) : (
                    <XCircle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{check.name}</p>
                    <p className="text-xs text-muted-foreground">{check.message}</p>
                  </div>
                </div>
              ))}
            </div>

            {result.passed ? (
              <Button
                onClick={handleProceed}
                className="w-full"
                disabled={!walletConnected}
              >
                Forward for Execution
                <Send className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <div className="rounded-md bg-destructive/10 border border-destructive/20 p-3">
                <p className="text-sm text-destructive font-medium">
                  Cannot proceed with policy violations
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Please fix the issues above and try again
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
