import { supabaseAdmin } from "@/lib/supabase/admin";
import {
  getAffiliateUpline,
  markReferralConverted,
} from "@/services/referralService";

/**
 * Affiliate commission rates.
 *
 * Level 1 = direct sponsor
 * Level 2 = sponsor's sponsor
 * Level 3 = third-level sponsor
 *
 * Matching bonus is intentionally NOT included.
 */
const COMMISSION_RATES = {
  1: 15,
  2: 3,
  3: 1,
} as const;

/**
 * Create affiliate commissions for a successful referred payment.
 *
 * One payment can create up to three commission records:
 *
 * Level 1 → 15%
 * Level 2 → 3%
 * Level 3 → 1%
 *
 * Example:
 *
 * PRO ₦5,000:
 * Level 1 = ₦750
 * Level 2 = ₦150
 * Level 3 = ₦50
 *
 * Maximum total network commission = ₦950.
 */
export async function createCommission({
  referredUserId,
  paymentReference,
  plan,
  paymentAmount,
  currency = "NGN",
}: {
  referredUserId: string;
  paymentReference: string;
  plan: string;
  paymentAmount: number;
  currency?: string;
}) {
  if (!referredUserId) {
    throw new Error("Missing referred user ID.");
  }

  if (!paymentReference) {
    throw new Error("Missing payment reference.");
  }

  if (paymentAmount <= 0) {
    throw new Error("Invalid payment amount.");
  }

  // --------------------------------------------------
  // 1. Check whether this payment already has
  //    affiliate commission records.
  // --------------------------------------------------

  const {
    data: existingCommissions,
    error: existingError,
  } = await supabaseAdmin
    .from("commissions")
    .select("*")
    .eq("payment_reference", paymentReference);

  if (existingError) {
    console.error(
      "Check Existing Commissions Error:",
      existingError
    );

    throw new Error(
      "Unable to check existing commissions."
    );
  }

  // If commissions already exist for this payment,
  // do not create them again.
  if (
    existingCommissions &&
    existingCommissions.length > 0
  ) {
    return {
      created: false,
      commissions: existingCommissions,
      reason: "ALREADY_PROCESSED",
    };
  }

  // --------------------------------------------------
  // 2. Find the direct referral.
  // --------------------------------------------------

  const {
    data: referral,
    error: referralError,
  } = await supabaseAdmin
    .from("referrals")
    .select("*")
    .eq("referred_user_id", referredUserId)
    .maybeSingle();

  if (referralError) {
    console.error(
      "Find Referral For Commission Error:",
      referralError
    );

    throw new Error(
      "Unable to find referral."
    );
  }

  // User was not referred by an affiliate.
  if (!referral) {
    return {
      created: false,
      commissions: [],
      reason: "NO_REFERRAL",
    };
  }

  // --------------------------------------------------
  // 3. Find the affiliate upline.
  //
  // Example:
  //
  // Customer → David → John → Peter
  //
  // Returns:
  // Level 1 = David
  // Level 2 = John
  // Level 3 = Peter
  // --------------------------------------------------

  const upline =
    await getAffiliateUpline(
      referredUserId
    );

  if (upline.length === 0) {
    return {
      created: false,
      commissions: [],
      reason: "NO_ACTIVE_UPLINE",
    };
  }

  // --------------------------------------------------
  // 4. Mark the customer's direct referral
  //    as converted.
  //
  // This happens once per qualifying payment.
  // --------------------------------------------------

  await markReferralConverted(
    referredUserId
  );

  // --------------------------------------------------
  // 5. Create commission records.
  // --------------------------------------------------

  const createdCommissions: any[] = [];

  for (const sponsor of upline) {
    const commissionRate =
      COMMISSION_RATES[sponsor.level];

    const commissionAmount =
      Math.round(
        paymentAmount *
          (commissionRate / 100) *
          100
      ) / 100;

    if (commissionAmount <= 0) {
      continue;
    }

    // ------------------------------------------------
    // Prevent duplicate commission for this specific
    // affiliate/payment/level combination.
    // ------------------------------------------------

    const {
      data: existingLevelCommission,
      error: existingLevelError,
    } = await supabaseAdmin
      .from("commissions")
      .select("*")
      .eq(
        "payment_reference",
        paymentReference
      )
      .eq(
        "affiliate_id",
        sponsor.affiliateId
      )
      .maybeSingle();

    if (existingLevelError) {
      console.error(
        `Check Existing Level ${sponsor.level} Commission Error:`,
        existingLevelError
      );

      throw new Error(
        "Unable to check existing level commission."
      );
    }

    if (existingLevelCommission) {
      createdCommissions.push(
        existingLevelCommission
      );

      continue;
    }

    // ------------------------------------------------
    // Create commission record.
    // ------------------------------------------------

    const {
      data: commission,
      error: commissionError,
    } = await supabaseAdmin
      .from("commissions")
      .insert({
        affiliate_id:
          sponsor.affiliateId,

        referral_id:
          sponsor.referralId,

        referred_user_id:
          referredUserId,

        payment_reference:
          paymentReference,

        plan,

        payment_amount:
          paymentAmount,

        commission_rate:
          commissionRate,

        commission_amount:
          commissionAmount,

        currency,

        status: "pending",
      })
      .select("*")
      .single();

    if (commissionError) {
      // Handle a race condition where another
      // request created the same commission first.
      if (
        commissionError.message
          .toLowerCase()
          .includes("duplicate")
      ) {
        const {
          data: duplicateCommission,
        } = await supabaseAdmin
          .from("commissions")
          .select("*")
          .eq(
            "payment_reference",
            paymentReference
          )
          .eq(
            "affiliate_id",
            sponsor.affiliateId
          )
          .maybeSingle();

        if (duplicateCommission) {
          createdCommissions.push(
            duplicateCommission
          );

          continue;
        }
      }

      console.error(
        `Create Level ${sponsor.level} Commission Error:`,
        commissionError
      );

      throw new Error(
        `Unable to create Level ${sponsor.level} commission.`
      );
    }

    createdCommissions.push(
      commission
    );

    // ------------------------------------------------
    // 6. Update affiliate earnings.
    // ------------------------------------------------

    const {
      data: affiliate,
      error: affiliateError,
    } = await supabaseAdmin
      .from("affiliate_profiles")
      .select(
        "total_earned, pending_earnings"
      )
      .eq(
        "id",
        sponsor.affiliateId
      )
      .maybeSingle();

    if (affiliateError) {
      console.error(
        `Get Affiliate Earnings Level ${sponsor.level} Error:`,
        affiliateError
      );

      throw new Error(
        "Commission created, but affiliate earnings could not be loaded."
      );
    }

    if (!affiliate) {
      throw new Error(
        "Commission created, but affiliate profile could not be found."
      );
    }

    const currentTotal =
      Number(
        affiliate.total_earned
      ) || 0;

    const currentPending =
      Number(
        affiliate.pending_earnings
      ) || 0;

    const {
      error: earningsError,
    } = await supabaseAdmin
      .from("affiliate_profiles")
      .update({
        total_earned:
          currentTotal +
          commissionAmount,

        pending_earnings:
          currentPending +
          commissionAmount,

        updated_at:
          new Date().toISOString(),
      })
      .eq(
        "id",
        sponsor.affiliateId
      );

    if (earningsError) {
      console.error(
        `Update Affiliate Earnings Level ${sponsor.level} Error:`,
        earningsError
      );

      throw new Error(
        "Commission created, but affiliate earnings could not be updated."
      );
    }
  }

  // --------------------------------------------------
  // 7. Return the commission results.
  // --------------------------------------------------

  return {
    created:
      createdCommissions.length > 0,

    commissions:
      createdCommissions,

    totalCommission:
      createdCommissions.reduce(
        (
          total,
          commission
        ) =>
          total +
          Number(
            commission.commission_amount
          ),
        0
      ),
  };
}