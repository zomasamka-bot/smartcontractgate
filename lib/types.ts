// Unified Record Schema for SmartContract Control Gate
export interface ContractRequest {
  id: string;
  referenceId: string;
  contractAddress: string;
  method: string;
  parameters: string;
  reason: string;
  status: "draft" | "pending" | "approved" | "rejected" | "executed" | "failed";
  timestamp: Date;
  executionHash?: string;
  policyCheckResult?: PolicyCheckResult;
}

export interface PolicyCheckResult {
  passed: boolean;
  checks: {
    name: string;
    passed: boolean;
    message: string;
  }[];
  timestamp: Date;
}

export interface ExecutionLog {
  id: string;
  referenceId: string;
  timestamp: Date;
  method: string;
  status: "success" | "failed";
  executionHash: string;
  contractAddress: string;
  gasUsed?: string;
  error?: string;
  policyCheckResult?: PolicyCheckResult;
}

// Action Configuration
export interface ActionConfig {
  type: "create" | "preview" | "check" | "execute" | "log";
  enabled: boolean;
  validations?: ValidationRule[];
}

export interface ValidationRule {
  field: string;
  rule: "required" | "address" | "minLength" | "maxLength";
  value?: string | number;
  message: string;
}
