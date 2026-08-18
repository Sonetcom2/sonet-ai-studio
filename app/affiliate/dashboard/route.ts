
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAffiliateByUserId } from "@/services/referralService";

export async function GET() {
  try {
    const supabase = await createClient();

    // ---------------------------------------------
    // 1. Verify authenticated user
    // ---------------------------------------------

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized.",
        },
        { status: 401 }
      );
    }

    // ---------------------------------------------
    // 2. Find affiliate profile
    // ---------------------------------------------

    let affiliate =
      await getAffiliateByUserId(user.id);

    // Automatically create an affiliate profile
    // for an authenticated user who does not have one.
    if (!affiliate) {
      const { createAffiliateProfile } =
        await import(
          "@/services/referralService"
        );

      affiliate =
        await createAffiliateProfile(user.id);
    }

    // ---------------------------------------------
    // 3. Get referrals
    // ---------------------------------------------

    const {
      data: referrals,
      error: referralsError,
    } = await supabase
      .from("referrals")
      .select(
        `
          id,
          referral_code,
          status,
          created_at,
          converted_at,
          referred_user_id
        `
      )
      .eq("affiliate_id", affiliate.id)
      .order("created_at", {
        ascending: false,
      });

    if (referralsError) {
      console.error(
        "Affiliate Referrals Error:",
        referralsError
      );

      return NextResponse.json(
        {
          success: false,
          error: referralsError.message,
        },
        { status: 500 }
      );
    }

    // ---------------------------------------------
    // 4. Get commissions
    // ---------------------------------------------

    const {
      data: commissions,
      error: commissionsError,
    } = await supabase
      .from("commissions")
      .select(
        `
          id,
          payment_reference,
          plan,
          payment_amount,
          commission_rate,
          commission_amount,
          currency,
          status,
          created_at,
          approved_at,
          paid_at
        `
      )
      .eq("affiliate_id", affiliate.id)
      .order("created_at", {
        ascending: false,
      });

    if (commissionsError) {
      console.error(
        "Affiliate Commissions Error:",
        commissionsError
      );

      return NextResponse.json(
        {
          success: false,
          error: commissionsError.message,
        },
        { status: 500 }
      );
    }

    // ---------------------------------------------
    // 5. Return affiliate dashboard data
    // ---------------------------------------------

    return NextResponse.json({
      success: true,

      affiliate: {
        id: affiliate.id,
        referralCode:
          affiliate.referral_code,
        commissionRate:
          Number(
            affiliate.commission_rate
          ),
        totalReferrals:
          Number(
            affiliate.total_referrals
          ),
        successfulReferrals:
          Number(
            affiliate.successful_referrals
          ),
        totalEarned:
          Number(
            affiliate.total_earned
          ),
        pendingEarnings:
          Number(
            affiliate.pending_earnings
          ),
        paidEarnings:
          Number(
            affiliate.paid_earnings
          ),
        status:
          affiliate.status,
        createdAt:
          affiliate.created_at,
      },

      referrals:
        referrals ?? [],

      commissions:
        commissions ?? [],
    });
  } catch (error) {
    console.error(
      "Affiliate Dashboard API Error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Unable to load affiliate dashboard.",
      },
      { status: 500 }
    );
  }
}