import { NextResponse } from "next/server";

export async function GET() {
	try {
		console.log("Test endpoint called");
		return NextResponse.json({ success: true, message: "Test endpoint working" });
	} catch (error) {
		console.error("Test endpoint error:", error);
		return NextResponse.json({ success: false, error: "Test failed" }, { status: 500 });
	}
}
