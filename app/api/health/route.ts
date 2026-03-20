import { NextResponse } from "next/server";
import { APP_CONFIG } from "@/lib/app-config";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    service: APP_CONFIG.NAME,
    network: APP_CONFIG.PI_NETWORK,
    appUrl: APP_CONFIG.BACKEND_URL,
    mode: "offline",
    message: "App is running in client-side mode with local storage",
  });
}
