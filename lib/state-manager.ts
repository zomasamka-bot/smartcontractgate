// Unified State Management System for SmartContract Control Gate
// Part of the Core Engine - manages global application state

import type { ContractRequest, ExecutionLog } from "./types";

export interface AppState {
  currentRequest: Partial<ContractRequest> | null;
  currentStep: "form" | "preview" | "policy" | "execution";
  currentPage: "home" | "activity";
  walletConnected: boolean;
  lastActivity: Date | null;
}

type StateListener = (state: AppState) => void;

class StateManager {
  private state: AppState;
  private listeners: Set<StateListener> = new Set();
  private readonly STORAGE_KEY = "smartcontract_app_state";

  constructor() {
    this.state = this.getInitialState();
    this.loadState();
    
    // Cross-tab synchronization
    if (typeof window !== "undefined") {
      window.addEventListener("storage", this.handleStorageChange);
    }
  }

  private getInitialState(): AppState {
    return {
      currentRequest: null,
      currentStep: "form",
      currentPage: "home",
      walletConnected: false,
      lastActivity: null,
    };
  }

  private loadState(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        this.state = {
          ...parsed,
          lastActivity: parsed.lastActivity ? new Date(parsed.lastActivity) : null,
          currentRequest: parsed.currentRequest ? {
            ...parsed.currentRequest,
            timestamp: parsed.currentRequest.timestamp 
              ? new Date(parsed.currentRequest.timestamp) 
              : undefined,
          } : null,
        };
      }
    } catch (error) {
      console.error("[StateManager] Failed to load state:", error);
    }
  }

  private saveState(): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.state));
    } catch (error) {
      console.error("[StateManager] Failed to save state:", error);
    }
  }

  private handleStorageChange = (e: StorageEvent): void => {
    if (e.key === this.STORAGE_KEY && e.newValue) {
      try {
        const newState = JSON.parse(e.newValue);
        this.state = {
          ...newState,
          lastActivity: newState.lastActivity ? new Date(newState.lastActivity) : null,
        };
        this.notifyListeners();
      } catch (error) {
        console.error("[StateManager] Failed to parse storage change:", error);
      }
    }
  };

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.state));
  }

  // Public API
  getState(): AppState {
    return { ...this.state };
  }

  setState(updates: Partial<AppState>): void {
    this.state = {
      ...this.state,
      ...updates,
      lastActivity: new Date(),
    };
    this.saveState();
    this.notifyListeners();
  }

  subscribe(listener: StateListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  reset(): void {
    this.state = this.getInitialState();
    this.saveState();
    this.notifyListeners();
  }
}

// Singleton instance
export const stateManager = new StateManager();
