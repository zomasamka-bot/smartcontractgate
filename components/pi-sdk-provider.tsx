"use client";

import { useEffect } from "react";
import { APP_CONFIG } from "@/lib/app-config";

declare global {
  interface Window {
    Pi?: any;
  }
}

/**
 * Loads the Pi SDK script and calls Pi.init() exactly once.
 *
 * CRITICAL: Pi.init() must be called only once, before Pi.authenticate().
 * It does NOT grant scopes — scopes are granted exclusively by Pi.authenticate().
 * Re-calling Pi.init() after authenticate() resets SDK internal state and
 * causes "missing payments scope" errors on the next createPayment call.
 * Therefore this provider calls init() once on script load and never again.
 */
export function PiSDKProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Pi Browser injects window.Pi automatically. For other environments
    // (dev preview, desktop), we load the SDK script manually.
    if (window.Pi) {
      // SDK already present — call init once and stop.
      window.Pi.init({
        version: APP_CONFIG.PI_SDK_VERSION,
        sandbox: APP_CONFIG.PI_SANDBOX_MODE,
      });
      return;
    }

    const script = document.createElement("script");
    script.src = "https://sdk.minepi.com/pi-sdk.js";
    // async:false ensures the script executes before the next line
    script.async = false;

    script.onload = () => {
      if (window.Pi) {
        window.Pi.init({
          version: APP_CONFIG.PI_SDK_VERSION,
          sandbox: APP_CONFIG.PI_SANDBOX_MODE,
        });
      }
    };

    document.head.appendChild(script);

    return () => {
      // Do not remove the script on unmount — Pi SDK must persist for the
      // full session. Removing and re-adding resets scope state.
    };
  }, []); // Empty deps: run exactly once on mount

  return <>{children}</>;
}
