import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import {
  getSettings,
  updateSettings,
} from "@/services/settingsService";

export async function GET() {
  try {
    await requireAdmin();

    const settings = await getSettings();

    return NextResponse.json({
      success: true,
      settings,
    });
  } catch (error) {
    console.error("Admin Settings GET Error:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Unable to load settings.",
      },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    await requireAdmin();

    const body = await req.json();

    const settings = await updateSettings({
      site_name: body.site_name,
      maintenance_mode: Boolean(body.maintenance_mode),
      free_credits: Number(body.free_credits),
      pro_price: Number(body.pro_price),
      pro_credits: Number(body.pro_credits),
      premium_price: Number(body.premium_price),
      image_generation_cost: Number(
        body.image_generation_cost
      ),
      video_generation_cost: Number(
        body.video_generation_cost
      ),
    });

    return NextResponse.json({
      success: true,
      settings,
    });
  } catch (error) {
    console.error("Admin Settings PUT Error:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Unable to update settings.",
      },
      { status: 500 }
    );
  }
}