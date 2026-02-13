// Centralized error logging and monitoring system

export type ErrorSeverity = "low" | "medium" | "high" | "critical";

export interface ErrorLog {
  id: string;
  timestamp: Date;
  severity: ErrorSeverity;
  message: string;
  context?: string;
  stack?: string;
  userAgent?: string;
  url?: string;
}

class ErrorLogger {
  private errors: ErrorLog[] = [];
  private maxErrors = 100;

  log(
    message: string,
    severity: ErrorSeverity = "medium",
    context?: string,
    error?: Error
  ): void {
    const errorLog: ErrorLog = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      severity,
      message,
      context,
      stack: error?.stack,
      userAgent: typeof window !== "undefined" ? window.navigator.userAgent : undefined,
      url: typeof window !== "undefined" ? window.location.href : undefined,
    };

    this.errors.unshift(errorLog);
    
    // Keep only recent errors
    if (this.errors.length > this.maxErrors) {
      this.errors = this.errors.slice(0, this.maxErrors);
    }

    // Log to console based on severity
    const consoleMethod = severity === "critical" || severity === "high" ? "error" : "warn";
    console[consoleMethod](`[ErrorLogger] [${severity.toUpperCase()}] ${message}`, {
      context,
      error,
    });

    // Store in localStorage for persistence
    try {
      localStorage.setItem("smartcontract_error_logs", JSON.stringify(this.errors.slice(0, 50)));
    } catch (e) {
      // Silently fail if storage is full
    }
  }

  getErrors(severity?: ErrorSeverity): ErrorLog[] {
    if (severity) {
      return this.errors.filter(e => e.severity === severity);
    }
    return this.errors;
  }

  clearErrors(): void {
    this.errors = [];
    try {
      localStorage.removeItem("smartcontract_error_logs");
    } catch (e) {
      // Silently fail
    }
  }

  loadFromStorage(): void {
    try {
      const stored = localStorage.getItem("smartcontract_error_logs");
      if (stored) {
        const parsed = JSON.parse(stored);
        this.errors = parsed.map((e: any) => ({
          ...e,
          timestamp: new Date(e.timestamp),
        }));
      }
    } catch (e) {
      console.error("[ErrorLogger] Failed to load from storage:", e);
    }
  }
}

// Singleton instance
export const errorLogger = new ErrorLogger();

// Initialize on import
if (typeof window !== "undefined") {
  errorLogger.loadFromStorage();
}
