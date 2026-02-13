"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export function TestnetBanner() {
  return (
    <Alert className="border-warning/50 bg-warning/10 mb-6">
      <AlertCircle className="h-4 w-4 text-warning" />
      <AlertDescription className="text-sm text-warning font-medium">
        TESTNET MODE - All transactions are executed on Pi Testnet. No real Pi is used.
      </AlertDescription>
    </Alert>
  );
}
