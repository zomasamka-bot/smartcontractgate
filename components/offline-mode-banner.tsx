"use client";

import { useEffect, useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Wifi, WifiOff } from "lucide-react";

export function OfflineModeBanner() {
  const [isOnline, setIsOnline] = useState(true);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const updateOnlineStatus = () => {
      setIsOnline(navigator.onLine);
      if (!navigator.onLine) {
        setShowBanner(true);
      }
    };

    // Check initial status
    updateOnlineStatus();

    // Listen for online/offline events
    window.addEventListener("online", updateOnlineStatus);
    window.addEventListener("offline", updateOnlineStatus);

    return () => {
      window.removeEventListener("online", updateOnlineStatus);
      window.removeEventListener("offline", updateOnlineStatus);
    };
  }, []);

  // Don't show banner if online
  if (isOnline) {
    return null;
  }

  return (
    <Alert className="mb-4 bg-warning/10 text-warning border-warning/20">
      <WifiOff className="h-4 w-4" />
      <AlertDescription>
        <span className="font-medium">Offline Mode:</span> App is running locally. All data is stored on your device. Functionality continues without a server connection.
      </AlertDescription>
    </Alert>
  );
}
