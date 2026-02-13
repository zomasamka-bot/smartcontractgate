import { NextResponse } from "next/server";
import { APP_CONFIG } from "@/lib/app-config";

export async function GET() {
  return NextResponse.json({
    name: APP_CONFIG.NAME,
    domain: APP_CONFIG.DOMAIN,
    description: APP_CONFIG.DESCRIPTION,
    mode: "client-side",
    features: {
      offlineMode: true,
      localStorage: true,
      piWallet: true,
      testnet: true,
    },
  });
}
