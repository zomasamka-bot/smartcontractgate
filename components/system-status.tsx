"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Check, X, Loader2 } from "lucide-react";

interface SystemStatus {
  backend: "online" | "offline" | "checking";
  localStorage: "available" | "unavailable";
  piWallet: "available" | "unavailable";
}

export function SystemStatus() {
  const [status, setStatus] = useState<SystemStatus>({
    backend: "checking",
    localStorage: "available",
    piWallet: "unavailable",
  });

  useEffect(() => {
    // Check localStorage
    try {
      localStorage.setItem("test", "test");
      localStorage.removeItem("test");
      setStatus(prev => ({ ...prev, localStorage: "available" }));
    } catch {
      setStatus(prev => ({ ...prev, localStorage: "unavailable" }));
    }

    // Check Pi Wallet
    if (typeof window !== "undefined" && window.Pi) {
      setStatus(prev => ({ ...prev, piWallet: "available" }));
    }

    // Check backend (non-blocking)
    fetch("/api/health")
      .then(() => setStatus(prev => ({ ...prev, backend: "online" })))
      .catch(() => setStatus(prev => ({ ...prev, backend: "offline" })));
  }, []);

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <Badge 
        variant="outline" 
        className={`gap-1 text-xs ${
          status.localStorage === "available" 
            ? "bg-primary/10 text-primary border-primary/20" 
            : "bg-destructive/10 text-destructive border-destructive/20"
        }`}
      >
        {status.localStorage === "available" ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
        Storage
      </Badge>

      <Badge 
        variant="outline" 
        className={`gap-1 text-xs ${
          status.backend === "online" 
            ? "bg-primary/10 text-primary border-primary/20" 
            : status.backend === "checking"
            ? "bg-secondary" 
            : "bg-muted text-muted-foreground"
        }`}
      >
        {status.backend === "checking" ? (
          <Loader2 className="h-3 w-3 animate-spin" />
        ) : status.backend === "online" ? (
          <Check className="h-3 w-3" />
        ) : (
          <X className="h-3 w-3" />
        )}
        Backend {status.backend === "offline" ? "(Optional)" : ""}
      </Badge>
    </div>
  );
}
