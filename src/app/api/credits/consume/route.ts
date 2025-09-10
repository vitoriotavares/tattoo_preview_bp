import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { CreditsService } from "@/lib/services/credits-service";

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await CreditsService.consumeCredit(session.user.id);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error, remainingCredits: result.remainingCredits },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      remainingCredits: result.remainingCredits,
      message: "Credit consumed successfully",
    });
  } catch (error) {
    console.error("Error consuming credit:", error);
    return NextResponse.json(
      { error: "Failed to consume credit" },
      { status: 500 }
    );
  }
}