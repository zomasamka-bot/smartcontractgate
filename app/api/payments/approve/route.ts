import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { paymentId } = body;

    console.log("[API] Payment approval requested:", paymentId);

    // For testnet, auto-approve all payments
    // In production, you would verify the payment with Pi Network backend
    
    return NextResponse.json({
      success: true,
      paymentId,
      message: "Payment approved for testnet"
    });
  } catch (error) {
    console.error("[API] Payment approval error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to approve payment" },
      { status: 500 }
    );
  }
}
