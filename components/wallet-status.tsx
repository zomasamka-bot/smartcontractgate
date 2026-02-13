"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Wallet, LogOut, Copy, Check } from "lucide-react";
import { usePiWallet } from "@/hooks/use-pi-wallet";
import { useState } from "react";

export function WalletStatus() {
  const { isConnected, isConnecting, address, username, connect, disconnect } = usePiWallet();
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (isConnecting) {
    return (
      <Button variant="outline" size="sm" disabled className="h-8 gap-2">
        <Wallet className="h-4 w-4 animate-pulse" />
        <span className="text-xs">Connecting...</span>
      </Button>
    );
  }

  if (!isConnected) {
    return (
      <Button 
        variant="outline" 
        size="sm" 
        onClick={connect}
        className="h-8 gap-2 hover:bg-primary/10 hover:text-primary hover:border-primary/20"
      >
        <Wallet className="h-4 w-4" />
        <span className="text-xs font-medium">Connect</span>
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="h-8 gap-2 bg-primary/10 text-primary border-primary/20 hover:bg-primary/20"
        >
          <Wallet className="h-4 w-4" />
          <span className="text-xs font-medium">{username || address?.slice(0, 8) || "Connected"}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Connected</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {username && (
          <div className="px-2 py-2">
            <p className="text-xs text-muted-foreground">Username</p>
            <p className="text-sm font-medium">{username}</p>
          </div>
        )}
        {address && (
          <div className="px-2 py-2">
            <p className="text-xs text-muted-foreground">Address</p>
            <code className="text-xs font-mono block truncate">{address}</code>
          </div>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleCopy}>
          {copied ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
          <span>{copied ? "Copied!" : "Copy Address"}</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={disconnect} className="text-destructive">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Disconnect</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
