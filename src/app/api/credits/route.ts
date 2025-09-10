import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { CreditsService } from "@/lib/services/credits-service";

export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Ensure user has credits record (create with free credits if not exists)
    const credits = await CreditsService.ensureUserCredits(session.user.id);

    return NextResponse.json(credits);
  } catch (error) {
    console.error("Error fetching user credits:", error);
    return NextResponse.json(
      { error: "Failed to fetch credits" },
      { status: 500 }
    );
  }
}