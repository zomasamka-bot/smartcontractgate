import { NextRequest, NextResponse } from "next/server";

const PI_API_BASE = "https://api.minepi.com";

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
    const { paymentId, txid } = body;

    if (!paymentId || !txid) {
      return NextResponse.json(
        { success: false, error: "paymentId and txid are required" },
        { status: 400 }
      );
    }

    const serverKey = getServerKey();

    if (!serverKey) {
      console.error(
        "[SmartContractGate] /api/payments/complete: No Pi Server API key found. " +
        "Add PI_SERVER_API_KEY to your Vercel environment variables."
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

    // Call the Pi Platform API to mark the payment as complete.
    // Must be called after the blockchain tx is confirmed (txid is available).
    const piResponse = await fetch(
      `${PI_API_BASE}/v2/payments/${paymentId}/complete`,
      {
        method: "POST",
        headers: {
          Authorization: `Key ${serverKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ txid }),
      }
    );

    const piBody = await piResponse.json().catch(() => ({}));

    if (!piResponse.ok) {
      console.error("[SmartContractGate] Pi Platform /complete failed:", piResponse.status, piBody);
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
      txid,
      status: piBody.status ?? "completed",
      message: "Payment confirmed and completed on Pi Testnet",
    });
  } catch (error) {
    console.error("[SmartContractGate] /api/payments/complete unexpected error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unexpected error in complete",
      },
      { status: 500 }
    );
  }
}
