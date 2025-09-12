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

    const result = await CreditsService.reserveCredit(session.user.id);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error, remainingCredits: result.remainingCredits },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      reservationId: result.reservationId,
      remainingCredits: result.remainingCredits,
      message: "Credit reserved successfully",
    });
  } catch (error) {
    console.error("Error reserving credit:", error);
    return NextResponse.json(
      { error: "Failed to reserve credit" },
      { status: 500 }
    );
  }
}