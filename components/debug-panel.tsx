"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Bug, CheckCircle, XCircle, Clock } from "lucide-react";

interface DebugPanelProps {
  isPiBrowser: boolean;
  windowPiExists: boolean;
  piInitCalled: boolean;
  piInitVersion: string;
  authenticateStarted: boolean;
  authenticateResult: string | null;
  authenticateError: string | null;
  currentUrl: string;
  userAgent: string;
  sdkLoadAttempts: number;
}

export function DebugPanel({
  isPiBrowser,
  windowPiExists,
  piInitCalled,
  piInitVersion,
  authenticateStarted,
  authenticateResult,
  authenticateError,
  currentUrl,
  userAgent,
  sdkLoadAttempts,
}: DebugPanelProps) {
  const StatusIndicator = ({ status }: { status: boolean | null }) => {
    if (status === null) return <Clock className="h-4 w-4 text-muted-foreground" />;
    return status ? (
      <CheckCircle className="h-4 w-4 text-primary" />
    ) : (
      <XCircle className="h-4 w-4 text-destructive" />
    );
  };

  return (
    <Card className="border-warning/50 bg-warning/5">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Bug className="h-5 w-5 text-warning" />
          <CardTitle className="text-base">Pi SDK Debug Panel (Testnet)</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 text-xs">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-medium">Pi Browser Detected:</span>
            <div className="flex items-center gap-2">
              <StatusIndicator status={isPiBrowser} />
              <Badge variant={isPiBrowser ? "outline" : "destructive"}>
                {isPiBrowser ? "YES" : "NO"}
              </Badge>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="font-medium">window.Pi exists:</span>
            <div className="flex items-center gap-2">
              <StatusIndicator status={windowPiExists} />
              <Badge variant={windowPiExists ? "outline" : "destructive"}>
                {windowPiExists ? "YES" : "NO"}
              </Badge>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="font-medium">SDK Load Attempts:</span>
            <Badge variant="secondary">{sdkLoadAttempts}</Badge>
          </div>

          <div className="flex items-center justify-between">
            <span className="font-medium">Pi.init() called:</span>
            <div className="flex items-center gap-2">
              <StatusIndicator status={piInitCalled} />
              <Badge variant={piInitCalled ? "outline" : "secondary"}>
                {piInitCalled ? "YES" : "NO"}
              </Badge>
            </div>
          </div>

          {piInitCalled && (
            <div className="flex items-center justify-between pl-4">
              <span className="text-muted-foreground">Init version:</span>
              <code className="text-xs bg-secondary px-2 py-0.5 rounded">
                {piInitVersion}
              </code>
            </div>
          )}

          <Separator />

          <div className="flex items-center justify-between">
            <span className="font-medium">authenticate() started:</span>
            <div className="flex items-center gap-2">
              <StatusIndicator status={authenticateStarted} />
              <Badge variant={authenticateStarted ? "outline" : "secondary"}>
                {authenticateStarted ? "YES" : "NO"}
              </Badge>
            </div>
          </div>

          {authenticateResult && (
            <div className="flex items-center justify-between">
              <span className="font-medium">Auth Result:</span>
              <Badge
                variant={
                  authenticateResult === "success"
                    ? "outline"
                    : authenticateResult === "cancelled"
                    ? "secondary"
                    : "destructive"
                }
              >
                {authenticateResult.toUpperCase()}
              </Badge>
            </div>
          )}

          {authenticateError && (
            <div className="space-y-1">
              <span className="font-medium text-destructive">Error Message:</span>
              <div className="bg-destructive/10 border border-destructive/20 rounded p-2">
                <code className="text-xs text-destructive break-all">
                  {authenticateError}
                </code>
              </div>
            </div>
          )}

          <Separator />

          <div className="space-y-1">
            <span className="font-medium">Current URL:</span>
            <code className="text-xs bg-secondary px-2 py-1 rounded block break-all">
              {currentUrl}
            </code>
          </div>

          <div className="space-y-1">
            <span className="font-medium">User Agent:</span>
            <code className="text-xs bg-secondary px-2 py-1 rounded block break-all">
              {userAgent}
            </code>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
