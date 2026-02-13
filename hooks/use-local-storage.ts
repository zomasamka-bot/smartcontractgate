"use client";

import { useState, useEffect, useCallback } from "react";
import type { ExecutionLog } from "@/lib/types";

const STORAGE_KEY = "smartcontract_execution_logs";
const STORAGE_VERSION = "v1";
const STORAGE_VERSION_KEY = "smartcontract_storage_version";

export function useLocalStorage() {
  const [logs, setLogs] = useState<ExecutionLog[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Parse logs from raw data
  const parseLogs = useCallback((data: string): ExecutionLog[] => {
    try {
      const parsed = JSON.parse(data);
      return parsed.map((log: any) => ({
        ...log,
        timestamp: new Date(log.timestamp),
        policyCheckResult: log.policyCheckResult ? {
          ...log.policyCheckResult,
          timestamp: new Date(log.policyCheckResult.timestamp),
        } : undefined,
      }));
    } catch (error) {
      console.error("[v0] Failed to parse logs:", error);
      return [];
    }
  }, []);

  // Load logs from localStorage
  const loadLogs = useCallback(() => {
    try {
      // Check storage version
      const version = localStorage.getItem(STORAGE_VERSION_KEY);
      if (version !== STORAGE_VERSION) {
        console.log("[v0] Storage version mismatch, clearing old data");
        localStorage.removeItem(STORAGE_KEY);
        localStorage.setItem(STORAGE_VERSION_KEY, STORAGE_VERSION);
      }

      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const logsWithDates = parseLogs(stored);
        setLogs(logsWithDates);
        console.log("[v0] Loaded", logsWithDates.length, "logs from local storage");
      }
    } catch (error) {
      console.error("[v0] Failed to load logs from localStorage:", error);
    } finally {
      setIsLoaded(true);
    }
  }, [parseLogs]);

  // Initial load
  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  // Cross-tab synchronization
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        console.log("[v0] Cross-tab sync: Logs updated in another tab");
        const logsWithDates = parseLogs(e.newValue);
        setLogs(logsWithDates);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [parseLogs]);

  // Save logs with atomic write and error recovery
  const saveLogs = useCallback((newLogs: ExecutionLog[]) => {
    try {
      const serialized = JSON.stringify(newLogs);
      localStorage.setItem(STORAGE_KEY, serialized);
      setLogs(newLogs);
      console.log("[v0] Saved", newLogs.length, "logs to local storage");
      
      // Dispatch custom event for same-tab components
      window.dispatchEvent(new CustomEvent("logsUpdated", { detail: newLogs }));
    } catch (error) {
      console.error("[v0] Failed to save logs to localStorage:", error);
      
      // Quota exceeded error recovery
      if (error instanceof Error && error.name === "QuotaExceededError") {
        console.log("[v0] Storage quota exceeded, removing oldest logs");
        const reducedLogs = newLogs.slice(0, Math.floor(newLogs.length / 2));
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(reducedLogs));
          setLogs(reducedLogs);
        } catch (retryError) {
          console.error("[v0] Failed to save even after reduction:", retryError);
        }
      }
    }
  }, []);

  const addLog = useCallback((log: ExecutionLog) => {
    const newLogs = [log, ...logs];
    saveLogs(newLogs);
  }, [logs, saveLogs]);

  const clearLogs = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      setLogs([]);
      console.log("[v0] Cleared all logs from local storage");
      window.dispatchEvent(new CustomEvent("logsUpdated", { detail: [] }));
    } catch (error) {
      console.error("[v0] Failed to clear logs:", error);
    }
  }, []);

  return {
    logs,
    isLoaded,
    addLog,
    clearLogs,
  };
}
