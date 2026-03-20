import { NextResponse } from "next/server";

// Optional backend endpoint for logs
// If this fails, the app will continue to work with local storage

export async function GET() {
  return NextResponse.json({
    logs: [],
    message: "Using client-side local storage. Backend is optional.",
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log("[API] Log received:", body);
    
    // Optional: Save to database here
    // For now, just acknowledge receipt
    
    return NextResponse.json({
      success: true,
      message: "Log received (stored client-side)",
    });
  } catch (error) {
    console.error("[API] Error processing log:", error);
    return NextResponse.json(
      { error: "Failed to process log" },
      { status: 500 }
    );
  }
}
