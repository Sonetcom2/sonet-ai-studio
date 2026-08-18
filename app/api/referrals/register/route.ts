
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  getAffiliateByReferralCode,
  createReferral,
  createAffiliateProfile,
} from "@/services/referralService";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const referralCode =
      typeof body?.referralCode === "string"
        ? body.referralCode.trim().toUpperCase()
        : "";

    if (!referralCode) {
      return NextResponse.json(
        {
          success: false,
          error: "Referral code is required.",
        },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: "You must be signed in to register a referral.",
        },
        { status: 401 }
      );
    }

    const affiliate =
      await getAffiliateByReferralCode(
        referralCode
      );

    if (!affiliate) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid or inactive referral code.",
        },
        { status: 404 }
      );
    }

    if (affiliate.user_id === user.id) {
      return NextResponse.json(
        {
          success: false,
          error: "You cannot use your own referral code.",
        },
        { status: 400 }
      );
    }

    const referral = await createReferral({
      affiliateId: affiliate.id,
      referredUserId: user.id,
      referralCode,
    });

    await createAffiliateProfile(user.id);

    return NextResponse.json({
      success: true,
      message: "Referral registered successfully.",
      referral: referral
        ? {
            id: referral.id,
            status: referral.status,
          }
        : null,
    });
  } catch (error) {
    console.error(
      "Referral registration API error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Unable to register referral.",
      },
      { status: 500 }
    );
  }
}
