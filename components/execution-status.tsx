"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { ContractRequest, ExecutionLog } from "@/lib/types";
import { Loader2, CheckCircle, Hash, Clock, FileText, Home, AlertTriangle, ExternalLink } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { usePiWallet } from "@/hooks/use-pi-wallet";

interface ExecutionStatusProps {
  request: ContractRequest;
  onComplete: (log: ExecutionLog) => void;
  onReset: () => void;
}

export function ExecutionStatus({ request, onComplete, onReset }: ExecutionStatusProps) {
  const [executing, setExecuting] = useState(false);
  const [signingWallet, setSigningWallet] = useState(true);
  const [executionLog, setExecutionLog] = useState<ExecutionLog | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { isConnected, signTransaction } = usePiWallet();

  useEffect(() => {
    const executeTransaction = async () => {
      if (!isConnected) {
        setError("Pi Wallet not connected. Please use Pi Browser.");
        setSigningWallet(false);
        return;
      }

      try {
        console.log("[v0] Requesting wallet signature...");
        setSigningWallet(true);

        // Request signature from Pi Wallet - this returns REAL Testnet transaction
        const { txid, signature } = await signTransaction(
          request.contractAddress,
          request.method,
          request.parameters
        );

        console.log("[v0] Transaction signed with TXID:", txid);
        setSigningWallet(false);
        setExecuting(true);

        // Simulate brief processing time for UI feedback
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Create execution log with REAL transaction ID
        const log: ExecutionLog = {
          id: Math.random().toString(36).substring(7),
          referenceId: request.referenceId,
          timestamp: new Date(),
          method: request.method,
          status: "success",
          executionHash: txid, // REAL Testnet transaction ID
          contractAddress: request.contractAddress,
          gasUsed: "Testnet",
          policyCheckResult: request.policyCheckResult,
        };

        console.log("[v0] Transaction executed successfully:", log);
        setExecutionLog(log);
        setExecuting(false);
        onComplete(log);
      } catch (err) {
        console.error("[v0] Transaction execution failed:", err);
        setError(err instanceof Error ? err.message : "Failed to execute transaction");
        setSigningWallet(false);
        setExecuting(false);
      }
    };

    executeTransaction();
  }, [request, onComplete, isConnected, signTransaction]);

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur">
      <CardHeader>
        <div className="flex items-center gap-2">
          {(signingWallet || executing) ? (
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
          ) : error ? (
            <AlertTriangle className="h-5 w-5 text-destructive" />
          ) : (
            <CheckCircle className="h-5 w-5 text-primary" />
          )}
          <CardTitle>
            {signingWallet 
              ? "Awaiting Wallet Signature" 
              : executing 
              ? "Executing on Testnet" 
              : error
              ? "Execution Failed"
              : "Execution Complete"}
          </CardTitle>
        </div>
        <CardDescription>
          {signingWallet 
            ? "Please approve the transaction in Pi Wallet"
            : executing 
            ? "Transaction is being processed on Pi Testnet"
            : error
            ? "The transaction could not be completed"
            : "Transaction has been successfully executed on Pi Testnet"
          }
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {signingWallet && (
          <div className="flex flex-col items-center justify-center py-8 space-y-3">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Waiting for Pi Wallet signature...</p>
            <p className="text-xs text-muted-foreground">Please check your wallet for the signature request</p>
          </div>
        )}

        {executing && !signingWallet && (
          <div className="flex flex-col items-center justify-center py-8 space-y-3">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Processing on Pi Testnet...</p>
          </div>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {!executing && executionLog && (
          <div className="space-y-4">
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
              Execution Successful
            </Badge>

            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <Hash className="h-4 w-4 text-muted-foreground mt-1 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-muted-foreground mb-1">
                    Reference ID
                  </p>
                  <code className="text-xs font-mono bg-secondary px-2 py-1 rounded block break-all">
                    {executionLog.referenceId}
                  </code>
                </div>
              </div>

              <Separator />

              <div className="flex items-start gap-2">
                <Hash className="h-4 w-4 text-muted-foreground mt-1 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-muted-foreground mb-1">
                    Transaction ID (Testnet)
                  </p>
                  <code className="text-xs font-mono bg-secondary px-2 py-1 rounded block break-all">
                    {executionLog.executionHash}
                  </code>
                  <a
                    href={`https://testnet.pi-blockchain.net/tx/${executionLog.executionHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-primary hover:underline flex items-center gap-1 mt-2"
                  >
                    View on Testnet Explorer
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>

              <Separator />

              <div className="flex items-start gap-2">
                <FileText className="h-4 w-4 text-muted-foreground mt-1 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-xs font-medium text-muted-foreground mb-1">
                    Method
                  </p>
                  <Badge variant="secondary" className="font-mono">
                    {executionLog.method}
                  </Badge>
                </div>
              </div>

              <Separator />

              <div className="flex items-start gap-2">
                <Clock className="h-4 w-4 text-muted-foreground mt-1 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-xs font-medium text-muted-foreground mb-1">
                    Timestamp
                  </p>
                  <p className="text-sm">
                    {executionLog.timestamp.toLocaleString()}
                  </p>
                </div>
              </div>

              {executionLog.gasUsed && (
                <>
                  <Separator />
                  <div className="flex items-start gap-2">
                    <Hash className="h-4 w-4 text-muted-foreground mt-1 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-xs font-medium text-muted-foreground mb-1">
                        Gas Used
                      </p>
                      <p className="text-sm font-mono">{executionLog.gasUsed}</p>
                    </div>
                  </div>
                </>
              )}
            </div>

            <Button
              onClick={onReset}
              className="w-full mt-6"
              variant="outline"
            >
              <Home className="mr-2 h-4 w-4" />
              Create New Request
            </Button>
          </div>
        )}

        {error && (
          <Button
            onClick={onReset}
            className="w-full"
            variant="outline"
          >
            <Home className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
