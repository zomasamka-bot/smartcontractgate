"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import type { ExecutionLog } from "@/lib/types";
import { History, CheckCircle, XCircle, ExternalLink, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface ExecutionHistoryProps {
  logs: ExecutionLog[];
}

export function ExecutionHistory({ logs }: ExecutionHistoryProps) {
  if (logs.length === 0) {
    return (
      <Card className="border-border/50 bg-card/50 backdrop-blur">
        <CardHeader>
          <div className="flex items-center gap-2">
            <History className="h-5 w-5 text-muted-foreground" />
            <CardTitle>Execution History</CardTitle>
          </div>
          <CardDescription>
            No executions yet
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {logs.map((log, index) => (
        <LogItem key={log.id} log={log} index={index} />
      ))}
    </div>
  );
}

function LogItem({ log, index }: { log: ExecutionLog; index: number }) {
  const [isOpen, setIsOpen] = useState(index === 0);

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              {log.status === "success" ? (
                <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
              ) : (
                <XCircle className="h-5 w-5 text-destructive flex-shrink-0" />
              )}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <CardTitle className="text-base truncate">
                    {log.method}
                  </CardTitle>
                  <Badge
                    variant={log.status === "success" ? "outline" : "destructive"}
                    className={log.status === "success" ? "bg-primary/10 text-primary border-primary/20" : ""}
                  >
                    {log.status}
                  </Badge>
                </div>
                <CardDescription className="text-xs mt-1">
                  {log.timestamp.toLocaleString()}
                </CardDescription>
              </div>
            </div>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                {isOpen ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            </CollapsibleTrigger>
          </div>
        </CardHeader>
        
        <CollapsibleContent>
          <CardContent className="space-y-3 pt-0">
            <Separator />
            
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">
                Reference ID
              </p>
              <code className="text-xs font-mono bg-secondary px-2 py-1 rounded block break-all">
                {log.referenceId}
              </code>
            </div>

            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">
                Transaction ID (Testnet)
              </p>
              <code className="text-xs font-mono bg-secondary px-2 py-1 rounded block break-all">
                {log.executionHash}
              </code>
              <a
                href={`https://testnet.pi-blockchain.net/tx/${log.executionHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary hover:underline flex items-center gap-1 mt-2"
              >
                View on Testnet Explorer
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>

            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">
                Contract Address
              </p>
              <code className="text-xs font-mono bg-secondary px-2 py-1 rounded block break-all">
                {log.contractAddress}
              </code>
            </div>

            {log.gasUsed && (
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">
                  Gas Used
                </p>
                <Badge variant="secondary" className="font-mono">
                  {log.gasUsed}
                </Badge>
              </div>
            )}

            {log.policyCheckResult && (
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">
                  Policy Check Result
                </p>
                <div className="space-y-2">
                  <Badge 
                    variant={log.policyCheckResult.passed ? "outline" : "destructive"}
                    className={log.policyCheckResult.passed ? "bg-primary/10 text-primary border-primary/20" : ""}
                  >
                    {log.policyCheckResult.passed ? "PASSED" : "FAILED"}
                  </Badge>
                  <div className="space-y-1.5 mt-2">
                    {log.policyCheckResult.checks.map((check, idx) => (
                      <div 
                        key={idx} 
                        className="flex items-start gap-2 text-xs bg-secondary/50 rounded px-2 py-1.5"
                      >
                        <span className={check.passed ? "text-primary" : "text-destructive"}>
                          {check.passed ? "✓" : "✗"}
                        </span>
                        <div className="flex-1">
                          <span className="font-medium">{check.name}:</span>{" "}
                          <span className="text-muted-foreground">{check.message}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {log.error && (
              <div>
                <p className="text-xs font-medium text-destructive mb-1">
                  Error
                </p>
                <p className="text-xs text-destructive bg-destructive/10 px-2 py-1 rounded">
                  {log.error}
                </p>
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
