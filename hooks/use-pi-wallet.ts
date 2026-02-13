"use client";

import { useState, useEffect, useCallback } from "react";

declare global {
  interface Window {
    Pi?: any;
  }
}

export function usePiWallet() {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  const [address, setAddress] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("pi_wallet_connection");
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setIsConnected(true);
        setUsername(data.username);
        setAddress(data.address);
      } catch (e) {
        localStorage.removeItem("pi_wallet_connection");
      }
    }
  }, []);

  const connect = useCallback(async () => {
    if (!window.Pi) {
      alert("Pi SDK not loaded. Please open this app in Pi Browser.");
      return;
    }

    setIsConnecting(true);

    try {
      const auth = await window.Pi.authenticate(["username"], () => {});

      const connectionData = {
        username: auth.user.username,
        address: auth.user.uid,
      };

      localStorage.setItem("pi_wallet_connection", JSON.stringify(connectionData));

      setIsConnected(true);
      setUsername(auth.user.username);
      setAddress(auth.user.uid);
    } catch (error: any) {
      alert(`Connection failed: ${error?.message || "Unknown error"}`);
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

  const signTransaction = useCallback(async (contractAddress: string, method: string, parameters: string) => {
    if (!window.Pi || !isConnected) throw new Error("Not connected");

    return new Promise<{ txid: string; signature: string }>((resolve, reject) => {
      window.Pi.createPayment({
        amount: 0.01,
        memo: `Contract: ${method}`,
        metadata: { contractAddress, method, parameters }
      }, {
        onReadyForServerCompletion: (paymentId: string, txid: string) => {
          resolve({ txid, signature: paymentId });
        },
        onCancel: () => reject(new Error("Cancelled")),
        onError: (error: Error) => reject(error),
      });
    });
  }, [isConnected]);

  return { isConnected, isConnecting, username, address, connect, disconnect, signTransaction };
}
