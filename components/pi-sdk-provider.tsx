"use client";

import { useEffect, useState } from "react";
import { APP_CONFIG } from "@/lib/app-config";

export function PiSDKProvider({ children }: { children: React.ReactNode }) {
  const [sdkLoaded, setSdkLoaded] = useState(false);

  useEffect(() => {
    // Check if SDK already loaded
    if (window.Pi) {
      try {
        window.Pi.init({ 
          version: APP_CONFIG.PI_SDK_VERSION
        });
        setSdkLoaded(true);
      } catch (e) {
        // Already initialized
        setSdkLoaded(true);
      }
      return;
    }

    // Load SDK script dynamically
    const script = document.createElement("script");
    script.src = "https://sdk.minepi.com/pi-sdk.js";
    script.async = false;
    
    script.onload = () => {
      if (window.Pi) {
        try {
          window.Pi.init({ 
            version: APP_CONFIG.PI_SDK_VERSION
          });
          setSdkLoaded(true);
        } catch (e) {
          // Already initialized
          setSdkLoaded(true);
        }
      }
    };

    script.onerror = () => {
      // Silent fail - will be caught when user tries to connect
    };

    document.head.appendChild(script);

    return () => {
      if (script.parentNode) {
        document.head.removeChild(script);
      }
    };
  }, []);

  return <>{children}</>;
}
