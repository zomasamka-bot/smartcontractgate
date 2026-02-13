import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    service: "SmartContract Control Gate",
    mode: "offline",
    message: "App is running in client-side mode with local storage",
  });
}
