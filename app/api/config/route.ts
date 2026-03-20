import { NextResponse } from "next/server";
import { APP_CONFIG } from "@/lib/app-config";

export async function GET() {
  return NextResponse.json({
    name: APP_CONFIG.NAME,
    domain: APP_CONFIG.DOMAIN,
    description: APP_CONFIG.DESCRIPTION,
    appUrl: APP_CONFIG.BACKEND_URL,
    appOrigin: APP_CONFIG.APP_ORIGIN,
    network: APP_CONFIG.PI_NETWORK,
    sandboxMode: APP_CONFIG.PI_SANDBOX_MODE,
    mode: "client-side",
    features: {
      offlineMode: true,
      localStorage: true,
      piWallet: true,
      testnet: APP_CONFIG.PI_NETWORK === "testnet",
    },
  });
}
