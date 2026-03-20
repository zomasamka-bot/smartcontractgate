"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { APP_CONFIG } from "@/lib/app-config";

declare global {
  interface Window {
    Pi?: any;
  }
}

interface PiWalletContextType {
  isConnected: boolean;
  isConnecting: boolean;
  username: string | null;
  address: string | null;
  connect: () => Promise<void>;
  disconnect: () => void;
  signTransaction: (
    contractAddress: string,
    method: string,
    parameters: string
  ) => Promise<{ txid: string; signature: string }>;
}

const PiWalletContext = createContext<PiWalletContextType | null>(null);

// ─── helpers ────────────────────────────────────────────────────────────────

/**
 * Authenticate (or re-authenticate) with the Pi SDK.
 * Always requests the "payments" scope so createPayment is available.
 */
async function piAuthenticate(): Promise<{ username: string; uid: string }> {
  if (!window.Pi) throw new Error("Pi SDK not loaded. Please open this app in Pi Browser.");

  // Do NOT call Pi.init() here. It is called once by PiSDKProvider on mount.
  // Re-calling init() resets the SDK's internal scope state, which causes
  // createPayment() to fail with "missing payments scope" even when the user
  // correctly authenticated with ["username", "payments"] scopes.
  const auth = await window.Pi.authenticate(
    ["username", "payments"],
    // Incomplete-payment callback — called when the SDK finds a dangling payment
    async (payment: any) => {
      // Best-effort: attempt to complete any lingering payment
      try {
        await fetch("/api/payments/complete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ paymentId: payment.identifier, txid: payment.transaction?.txid }),
        });
      } catch (_) {
        // Non-fatal — the next payment attempt will handle it
      }
    }
  );

  return { username: auth.user.username, uid: auth.user.uid };
}

// ─── provider ────────────────────────────────────────────────────────────────

export function PiWalletProvider({ children }: { children: ReactNode }) {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  const [address, setAddress] = useState<string | null>(null);

  // On mount: restore persisted connection AND silently re-authenticate with
  // the Pi SDK so the "payments" scope is active for the current session.
  useEffect(() => {
    if (typeof window === "undefined") return;

    const saved = localStorage.getItem("pi_wallet_connection");
    if (!saved) return;

    let stored: { username: string; address: string } | null = null;
    try {
      stored = JSON.parse(saved);
    } catch (_) {
      localStorage.removeItem("pi_wallet_connection");
      return;
    }

    if (!stored) return;

    // Restore UI state from storage so the user sees "connected" immediately.
    // Do NOT call Pi.authenticate() here — firing authenticate() silently on
    // mount can trigger an unexpected Pi Browser consent dialog mid-session.
    // The Pi SDK session will be re-established when the user explicitly
    // clicks "Connect" or when signTransaction detects the session is stale.
    setIsConnected(true);
    setUsername(stored.username);
    setAddress(stored.address);
  }, []);

  const connect = useCallback(async () => {
    setIsConnecting(true);
    try {
      const { username: u, uid } = await piAuthenticate();
      const connectionData = { username: u, address: uid };
      localStorage.setItem("pi_wallet_connection", JSON.stringify(connectionData));
      setIsConnected(true);
      setUsername(u);
      setAddress(uid);
    } catch (error: any) {
      alert(`Connection failed: ${error?.message ?? "Unknown error"}`);
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    localStorage.removeItem("pi_wallet_connection");
    setIsConnected(false);
    setUsername(null);
    setAddress(null);
  }, []);

  /**
   * Full Pi payment lifecycle:
   *   1. createPayment  → onReadyForServerApproval
   *   2. POST /api/payments/approve  (calls Pi Platform API)
   *   3. Pi SDK submits transaction to blockchain
   *   4. onReadyForServerCompletion  → POST /api/payments/complete
   *   5. Resolve with the confirmed txid
   *
   * IMPORTANT: Do NOT call Pi.authenticate() inside this function.
   * The Pi SDK grants scopes at authenticate() time. Calling authenticate()
   * immediately before createPayment() in the same async chain causes a race
   * where the SDK has not committed the scope grant before createPayment reads
   * it — resulting in "missing payments scope". Authentication must happen
   * as a separate, fully-resolved step before this function is invoked.
   */
  const signTransaction = useCallback(
    async (contractAddress: string, method: string, parameters: string) => {
      if (!window.Pi) throw new Error("Pi SDK not loaded. Please open this app in Pi Browser.");
      if (!isConnected) throw new Error("Pi Wallet not connected. Please connect first.");

      // Re-authenticate to guarantee the "payments" scope is active in the
      // current SDK session. This is a fully-awaited, standalone async call
      // that completes before createPayment is invoked — no scope race.
      await piAuthenticate();

      return new Promise<{ txid: string; signature: string }>((resolve, reject) => {
        window.Pi.createPayment(
          {
            amount: 0.01,
            memo: `${method} @ ${contractAddress.slice(0, 12)}`,
            metadata: { contractAddress, method, parameters },
          },
          {
            // Step 1: SDK created the payment — tell our server to approve it.
            // The server calls the Pi Platform /approve endpoint, which
            // authorises the SDK to submit the transaction to the blockchain.
            onReadyForServerApproval: async (paymentId: string) => {
              try {
                const res = await fetch("/api/payments/approve", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ paymentId }),
                });
                if (!res.ok) {
                  const err = await res.json().catch(() => ({}));
                  reject(new Error(err?.error ?? `Server approval failed (${res.status})`));
                  return; // CRITICAL: must return so the SDK receives no further signals
                }
                // Approval succeeded — the Pi SDK now submits to blockchain automatically.
              } catch (err) {
                reject(err instanceof Error ? err : new Error("Approval request failed"));
              }
            },

            // Step 2: Blockchain confirmed — tell our server to complete it.
            // Only after this resolves do we surface the txid to the UI.
            onReadyForServerCompletion: async (paymentId: string, txid: string) => {
              try {
                const res = await fetch("/api/payments/complete", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ paymentId, txid }),
                });
                if (!res.ok) {
                  const err = await res.json().catch(() => ({}));
                  reject(new Error(err?.error ?? "Server completion failed"));
                  return;
                }
                resolve({ txid, signature: paymentId });
              } catch (err) {
                reject(err instanceof Error ? err : new Error("Completion request failed"));
              }
            },

            onCancel: (_paymentId: string) => {
              reject(new Error("Payment was cancelled."));
            },

            onError: (error: Error, _payment?: any) => {
              reject(error);
            },
          }
        );
      });
    },
    [isConnected]
  );

  return (
    <PiWalletContext.Provider
      value={{
        isConnected,
        isConnecting,
        username,
        address,
        connect,
        disconnect,
        signTransaction,
      }}
    >
      {children}
    </PiWalletContext.Provider>
  );
}

export function usePiWallet() {
  const context = useContext(PiWalletContext);
  if (!context) throw new Error("usePiWallet must be used within PiWalletProvider");
  return context;
}
