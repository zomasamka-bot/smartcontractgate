"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { ContractRequest } from "@/lib/types";
import { Eye, ArrowLeft, CheckCircle2 } from "lucide-react";

interface ContractPreviewProps {
  request: Partial<ContractRequest>;
  onBack: () => void;
  onProceed: () => void;
}

export function ContractPreview({ request, onBack, onProceed }: ContractPreviewProps) {
  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Eye className="h-5 w-5 text-accent" />
          <CardTitle>Preview Request</CardTitle>
        </div>
        <CardDescription>
          Review contract call details before policy check
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">
              Contract Address
            </p>
            <code className="text-sm font-mono bg-secondary px-3 py-2 rounded-md block break-all">
              {request.contractAddress}
            </code>
          </div>

          <Separator />

          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">
              Method
            </p>
            <Badge variant="outline" className="font-mono">
              {request.method}
            </Badge>
          </div>

          <Separator />

          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">
              Parameters
            </p>
            <pre className="text-xs font-mono bg-secondary px-3 py-2 rounded-md overflow-x-auto">
              {JSON.stringify(JSON.parse(request.parameters || "{}"), null, 2)}
            </pre>
          </div>

          <Separator />

          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">
              Reason
            </p>
            <p className="text-sm bg-secondary px-3 py-2 rounded-md">
              {request.reason}
            </p>
          </div>
        </div>

        <div className="flex gap-2 pt-4">
          <Button
            variant="outline"
            onClick={onBack}
            className="flex-1"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <Button
            onClick={onProceed}
            className="flex-1"
          >
            Run Policy Check
            <CheckCircle2 className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
