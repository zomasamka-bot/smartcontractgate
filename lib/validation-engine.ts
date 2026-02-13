// Unified Validation Engine - Part of Action Configuration System
// Provides extensible validation rules without structural changes

import type { ValidationRule, ContractRequest } from "./types";
import { errorLogger } from "./error-logger";

export interface ValidationResult {
  isValid: boolean;
  errors: Array<{
    field: string;
    message: string;
  }>;
}

class ValidationEngine {
  // Core validation rules
  private validators = {
    required: (value: any): boolean => {
      return value !== null && value !== undefined && value !== "";
    },
    
    address: (value: string): boolean => {
      // Pi Network address format validation
      return /^(0x)?[0-9a-fA-F]{40}$/.test(value);
    },
    
    minLength: (value: string, min: number): boolean => {
      return value.length >= min;
    },
    
    maxLength: (value: string, max: number): boolean => {
      return value.length <= max;
    },
    
    json: (value: string): boolean => {
      try {
        JSON.parse(value);
        return true;
      } catch {
        return false;
      }
    },
    
    methodName: (value: string): boolean => {
      // Method names should be alphanumeric with underscores
      return /^[a-zA-Z][a-zA-Z0-9_]*$/.test(value);
    },
  };

  validate(data: Partial<ContractRequest>, rules: ValidationRule[]): ValidationResult {
    const errors: Array<{ field: string; message: string }> = [];

    for (const rule of rules) {
      const value = (data as any)[rule.field];
      let isValid = true;

      try {
        switch (rule.rule) {
          case "required":
            isValid = this.validators.required(value);
            break;
          case "address":
            isValid = this.validators.address(value);
            break;
          case "minLength":
            isValid = this.validators.minLength(value, rule.value as number);
            break;
          case "maxLength":
            isValid = this.validators.maxLength(value, rule.value as number);
            break;
          default:
            errorLogger.log(
              `Unknown validation rule: ${rule.rule}`,
              "medium",
              "ValidationEngine.validate"
            );
        }

        if (!isValid) {
          errors.push({
            field: rule.field,
            message: rule.message,
          });
        }
      } catch (error) {
        errorLogger.log(
          `Validation error for field ${rule.field}`,
          "high",
          "ValidationEngine.validate",
          error as Error
        );
        errors.push({
          field: rule.field,
          message: "Validation failed",
        });
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  // Extensible: Add custom validators without changing structure
  addValidator(name: string, validator: (value: any, param?: any) => boolean): void {
    (this.validators as any)[name] = validator;
  }

  // Pre-execution validation
  validateForExecution(request: Partial<ContractRequest>): ValidationResult {
    const rules: ValidationRule[] = [
      { field: "contractAddress", rule: "required", message: "Contract address is required" },
      { field: "contractAddress", rule: "address", message: "Invalid contract address format" },
      { field: "method", rule: "required", message: "Method name is required" },
      { field: "parameters", rule: "required", message: "Parameters are required" },
      { field: "reason", rule: "required", message: "Reason is required" },
      { field: "reason", rule: "minLength", value: 10, message: "Reason must be at least 10 characters" },
    ];

    return this.validate(request, rules);
  }
}

// Singleton instance
export const validationEngine = new ValidationEngine();
