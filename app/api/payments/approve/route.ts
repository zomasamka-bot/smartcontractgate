import { NextRequest, NextResponse } from "next/server";

const PI_API_BASE = "https://api.minepi.com";

/**
 * Resolves the Pi Server API key from any of the common env var names
 * that may have been set on Vercel. The Pi Developer Portal issues a single
 * server-side key — the exact variable name the user chose may differ.
 */
function getServerKey(): string | null {
  return (
    process.env.PI_SERVER_API_KEY ??
    process.env.PI_API_KEY ??
    process.env.PI_SECRET_KEY ??
    process.env.PI_SERVER_KEY ??
    null
  );
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { paymentId } = body;

    if (!paymentId) {
      return NextResponse.json(
        { success: false, error: "paymentId is required" },
        { status: 400 }
      );
    }

    const serverKey = getServerKey();

    if (!serverKey) {
      // Log clearly for Vercel log inspection
      console.error(
        "[SmartContractGate] /api/payments/approve: No Pi Server API key found. " +
        "Add PI_SERVER_API_KEY to your Vercel environment variables. " +
        "Obtain the key from https://develop.pi > your app > Server-Side Key."
      );
      return NextResponse.json(
        {
          success: false,
          error:
            "Server API key not configured. Add PI_SERVER_API_KEY to Vercel environment variables.",
        },
        { status: 500 }
      );
    }

    // Call the Pi Platform API to approve the payment.
    // This authorises the Pi SDK to submit the transaction to the blockchain.
    const piResponse = await fetch(
      `${PI_API_BASE}/v2/payments/${paymentId}/approve`,
      {
        method: "POST",
        headers: {
          Authorization: `Key ${serverKey}`,
          "Content-Type": "application/json",
        },
      }
    );

    const piBody = await piResponse.json().catch(() => ({}));

    if (!piResponse.ok) {
      console.error("[SmartContractGate] Pi Platform /approve failed:", piResponse.status, piBody);
      return NextResponse.json(
        {
          success: false,
          error: piBody?.error_message ?? piBody?.message ?? `Pi API error ${piResponse.status}`,
          piStatus: piResponse.status,
        },
        { status: piResponse.status }
      );
    }

    return NextResponse.json({
      success: true,
      paymentId,
      status: piBody.status ?? "approved",
      message: "Payment approved — Pi SDK will now submit to blockchain",
    });
  } catch (error) {
    console.error("[SmartContractGate] /api/payments/approve unexpected error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unexpected error in approve",
      },
      { status: 500 }
    );
  }
}
