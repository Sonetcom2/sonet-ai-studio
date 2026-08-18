
import { supabaseAdmin } from "@/lib/supabase/admin";
import { markReferralConverted } from "@/services/referralService";

/**
 * Create a commission for a successful referred payment.
 *
 * Commission is calculated from the verified payment amount.
 *
 * Example:
 * PRO ₦5,000 × 20% = ₦1,000
 * PREMIUM ₦25,000 × 20% = ₦5,000
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
  // 1. Prevent duplicate commission
  // --------------------------------------------------

  const { data: existingCommission, error: existingError } =
    await supabaseAdmin
      .from("commissions")
      .select("*")
      .eq("payment_reference", paymentReference)
      .maybeSingle();

  if (existingError) {
    console.error(
      "Check Existing Commission Error:",
      existingError
    );

    throw new Error(
      "Unable to check existing commission."
    );
  }

  if (existingCommission) {
    return {
      created: false,
      commission: existingCommission,
    };
  }

  // --------------------------------------------------
  // 2. Find the referral
  // --------------------------------------------------

  const { data: referral, error: referralError } =
    await supabaseAdmin
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
      commission: null,
      reason: "NO_REFERRAL",
    };
  }

  // --------------------------------------------------
  // 3. Find affiliate profile
  // --------------------------------------------------

  const { data: affiliate, error: affiliateError } =
    await supabaseAdmin
      .from("affiliate_profiles")
      .select("*")
      .eq("id", referral.affiliate_id)
      .maybeSingle();

  if (affiliateError) {
    console.error(
      "Find Affiliate For Commission Error:",
      affiliateError
    );

    throw new Error(
      "Unable to find affiliate profile."
    );
  }

  if (!affiliate) {
    throw new Error(
      "Affiliate profile not found."
    );
  }

  if (affiliate.status !== "active") {
    return {
      created: false,
      commission: null,
      reason: "AFFILIATE_INACTIVE",
    };
  }

  // --------------------------------------------------
  // 4. Calculate commission
  // --------------------------------------------------

  const commissionRate =
    Number(affiliate.commission_rate) || 0;

  const commissionAmount =
    Math.round(
      paymentAmount *
        (commissionRate / 100) *
        100
    ) / 100;

  if (commissionAmount <= 0) {
    return {
      created: false,
      commission: null,
      reason: "ZERO_COMMISSION",
    };
  }

  // --------------------------------------------------
  // 5. Mark referral as converted
  // --------------------------------------------------

  await markReferralConverted(
    referredUserId
  );

  // --------------------------------------------------
  // 6. Create commission record
  // --------------------------------------------------

  const { data: commission, error: commissionError } =
    await supabaseAdmin
      .from("commissions")
      .insert({
        affiliate_id: affiliate.id,
        referral_id: referral.id,
        referred_user_id: referredUserId,
        payment_reference: paymentReference,
        plan,
        payment_amount: paymentAmount,
        commission_rate: commissionRate,
        commission_amount: commissionAmount,
        currency,
        status: "pending",
      })
      .select("*")
      .single();

  if (commissionError) {
    // Handle race conditions where another request
    // created the commission first.
    if (
      commissionError.message
        .toLowerCase()
        .includes("duplicate")
    ) {
      const { data: duplicateCommission } =
        await supabaseAdmin
          .from("commissions")
          .select("*")
          .eq(
            "payment_reference",
            paymentReference
          )
          .maybeSingle();

      return {
        created: false,
        commission: duplicateCommission,
      };
    }

    console.error(
      "Create Commission Error:",
      commissionError
    );

    throw new Error(
      "Unable to create commission."
    );
  }

  // --------------------------------------------------
  // 7. Update affiliate earnings
  // --------------------------------------------------

  const currentTotal =
    Number(affiliate.total_earned) || 0;

  const currentPending =
    Number(affiliate.pending_earnings) || 0;

  const { error: earningsError } =
    await supabaseAdmin
      .from("affiliate_profiles")
      .update({
        total_earned:
          currentTotal + commissionAmount,

        pending_earnings:
          currentPending + commissionAmount,

        updated_at:
          new Date().toISOString(),
      })
      .eq("id", affiliate.id);

  if (earningsError) {
    console.error(
      "Update Affiliate Earnings Error:",
      earningsError
    );

    // The commission record already exists.
    // We deliberately do not delete it.
    throw new Error(
      "Commission created, but affiliate earnings could not be updated."
    );
  }

  return {
    created: true,
    commission,
  };
}