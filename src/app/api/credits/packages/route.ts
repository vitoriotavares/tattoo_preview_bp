import { NextRequest, NextResponse } from "next/server";
import { CreditsService } from "@/lib/services/credits-service";

export async function GET(req: NextRequest) {
  try {
    // Ensure default packages exist
    await CreditsService.createDefaultPackages();
    
    // Get available packages
    const packages = await CreditsService.getAvailablePackages();

    return NextResponse.json(packages);
  } catch (error) {
    console.error("Error fetching credit packages:", error);
    return NextResponse.json(
      { error: "Failed to fetch packages" },
      { status: 500 }
    );
  }
}