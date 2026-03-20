"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { ContractRequest } from "@/lib/types";
import { Shield, ArrowRight } from "lucide-react";

interface ContractRequestFormProps {
  onSubmit: (request: Partial<ContractRequest>) => void;
}

export function ContractRequestForm({ onSubmit }: ContractRequestFormProps) {
  const [formData, setFormData] = useState({
    contractAddress: "",
    method: "",
    parameters: "",
    reason: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const isValidJson = (str: string) => {
    if (!str.trim()) return false;
    try {
      JSON.parse(str);
      return true;
    } catch {
      return false;
    }
  };

  const validations = {
    contractAddress: formData.contractAddress.trim().length > 0,
    method: formData.method.trim().length > 0,
    parameters: isValidJson(formData.parameters),
    reason: formData.reason.trim().length > 0,
  };

  const isFormValid = Object.values(validations).every(Boolean);

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          <CardTitle>Create Request</CardTitle>
        </div>
        <CardDescription>
          Enter contract details for execution control
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="contractAddress">Target Address / Identifier</Label>
            <Input
              id="contractAddress"
              placeholder="GABC...XYZ or UUID or custom identifier"
              value={formData.contractAddress}
              onChange={(e) =>
                setFormData({ ...formData, contractAddress: e.target.value })
              }
              className="font-mono text-sm"
              required
            />
            <p className="text-xs text-muted-foreground">
              Accepts a Pi Stellar address (starts with G, 56 chars), a UUID, or any identifier of 8+ characters. Deploying a smart contract is not required — this field identifies the payment target or operation scope on Pi Testnet.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="method">Method</Label>
            <Input
              id="method"
              placeholder="transfer"
              value={formData.method}
              onChange={(e) =>
                setFormData({ ...formData, method: e.target.value })
              }
              required
            />
            <p className="text-xs text-muted-foreground">
              Function name to call on the smart contract
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="parameters">Parameters</Label>
            <Textarea
              id="parameters"
              placeholder='{"to": "0x...", "amount": "100"}'
              value={formData.parameters}
              onChange={(e) =>
                setFormData({ ...formData, parameters: e.target.value })
              }
              className={`font-mono text-sm min-h-24 ${
                formData.parameters && !validations.parameters
                  ? "border-destructive focus-visible:ring-destructive"
                  : ""
              }`}
              required
            />
            {formData.parameters && !validations.parameters ? (
              <p className="text-xs text-destructive">Invalid JSON format. Example: {"{"}"key": "value"{"}"}</p>
            ) : (
              <p className="text-xs text-muted-foreground">Enter parameters in JSON format</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">Reason</Label>
            <Textarea
              id="reason"
              placeholder="Explain the purpose of this contract call"
              value={formData.reason}
              onChange={(e) =>
                setFormData({ ...formData, reason: e.target.value })
              }
              className="min-h-20"
              required
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={!isFormValid}
          >
            Continue to Preview
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>

          {!isFormValid && (formData.contractAddress || formData.method || formData.parameters || formData.reason) && (
            <p className="text-xs text-muted-foreground text-center">
              {!validations.contractAddress && "Target address or identifier required. "}
              {!validations.method && "Method name required. "}
              {!validations.parameters && formData.parameters && "Fix JSON format in Parameters. "}
              {!validations.parameters && !formData.parameters && "Parameters required (use {} for none). "}
              {!validations.reason && "Reason required."}
            </p>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
