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

    const { reservationId } = await req.json();

    if (!reservationId) {
      return NextResponse.json(
        { error: "Reservation ID is required" },
        { status: 400 }
      );
    }

    const result = await CreditsService.rollbackCreditReservation(
      session.user.id,
      reservationId
    );

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Credit reservation cancelled successfully",
    });
  } catch (error) {
    console.error("Error rolling back credit reservation:", error);
    return NextResponse.json(
      { error: "Failed to rollback credit reservation" },
      { status: 500 }
    );
  }
}