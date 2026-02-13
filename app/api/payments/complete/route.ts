import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { paymentId, txid } = body;

    console.log("[API] Payment completion requested:", { paymentId, txid });

    // For testnet, auto-complete all payments
    // In production, you would verify the transaction with Pi Network backend
    
    return NextResponse.json({
      success: true,
      paymentId,
      txid,
      message: "Payment completed for testnet"
    });
  } catch (error) {
    console.error("[API] Payment completion error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to complete payment" },
      { status: 500 }
    );
  }
}
