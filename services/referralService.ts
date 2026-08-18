
import { supabaseAdmin } from "@/lib/supabase/admin";

const DEFAULT_COMMISSION_RATE = 20;

function generateReferralCode(length = 8): string {
  const characters = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

  let code = "";

  for (let i = 0; i < length; i++) {
    code += characters.charAt(
      Math.floor(Math.random() * characters.length)
    );
  }

  return `SONET${code}`;
}

/**
 * Create an affiliate profile for a user.
 *
 * If the user already has an affiliate profile,
 * the existing profile is returned.
 */
export async function createAffiliateProfile(
  userId: string
) {
  const { data: existing, error: existingError } =
    await supabaseAdmin
      .from("affiliate_profiles")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

  if (existingError) {
    console.error(
      "Check Affiliate Profile Error:",
      existingError
    );

    throw new Error(
      "Unable to check affiliate profile."
    );
  }

  if (existing) {
    return existing;
  }

  for (let attempt = 0; attempt < 10; attempt++) {
    const referralCode = generateReferralCode();

    const { data, error } = await supabaseAdmin
      .from("affiliate_profiles")
      .insert({
        user_id: userId,
        referral_code: referralCode,
        commission_rate: DEFAULT_COMMISSION_RATE,
        total_referrals: 0,
        successful_referrals: 0,
        total_earned: 0,
        pending_earnings: 0,
        paid_earnings: 0,
        status: "active",
      })
      .select("*")
      .single();

    if (!error) {
      return data;
    }

    const errorMessage = error.message.toLowerCase();

    if (
      !errorMessage.includes("duplicate") &&
      !errorMessage.includes("unique")
    ) {
      console.error(
        "Create Affiliate Profile Error:",
        error
      );

      throw new Error(
        "Unable to create affiliate profile."
      );
    }
  }

  throw new Error(
    "Unable to generate a unique referral code."
  );
}

/**
 * Get an affiliate profile using the user's ID.
 */
export async function getAffiliateByUserId(
  userId: string
) {
  const { data, error } = await supabaseAdmin
    .from("affiliate_profiles")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    console.error(
      "Get Affiliate Profile Error:",
      error
    );

    throw new Error(
      "Unable to load affiliate profile."
    );
  }

  return data;
}

/**
 * Get an active affiliate using a referral code.
 */
export async function getAffiliateByReferralCode(
  referralCode: string
) {
  const normalizedCode = referralCode
    .trim()
    .toUpperCase();

  if (!normalizedCode) {
    return null;
  }

  const { data, error } = await supabaseAdmin
    .from("affiliate_profiles")
    .select("*")
    .eq("referral_code", normalizedCode)
    .eq("status", "active")
    .maybeSingle();

  if (error) {
    console.error(
      "Find Affiliate By Referral Code Error:",
      error
    );

    throw new Error(
      "Unable to find referral code."
    );
  }

  return data;
}

/**
 * Create a referral record for a newly registered user.
 *
 * A user can only have one referral.
 */
export async function createReferral({
  affiliateId,
  referredUserId,
  referralCode,
}: {
  affiliateId: string;
  referredUserId: string;
  referralCode: string;
}) {
  // Prevent self-referrals.
  if (affiliateId === referredUserId) {
    return null;
  }

  // Prevent duplicate attribution.
  const { data: existingReferral, error: existingError } =
    await supabaseAdmin
      .from("referrals")
      .select("*")
      .eq("referred_user_id", referredUserId)
      .maybeSingle();

  if (existingError) {
    console.error(
      "Check Referral Error:",
      existingError
    );

    throw new Error(
      "Unable to check referral."
    );
  }

  if (existingReferral) {
    return existingReferral;
  }

  const normalizedCode = referralCode
    .trim()
    .toUpperCase();

  const { data, error } = await supabaseAdmin
    .from("referrals")
    .insert({
      affiliate_id: affiliateId,
      referred_user_id: referredUserId,
      referral_code: normalizedCode,
      status: "registered",
    })
    .select("*")
    .single();

  if (error) {
    console.error(
      "Create Referral Error:",
      error
    );

    throw new Error(
      "Unable to create referral."
    );
  }

  // Atomically increment the affiliate's referral count.
  const { error: incrementError } =
    await supabaseAdmin.rpc(
      "increment_affiliate_referrals",
      {
        affiliate_uuid: affiliateId,
      }
    );

  if (incrementError) {
    console.error(
      "Increment Affiliate Referral Error:",
      incrementError
    );

    // We do not delete the referral here because the
    // referral itself was successfully created.
  }

  return data;
}

/**
 * Mark a referral as converted after the referred
 * user completes a qualifying payment.
 */
export async function markReferralConverted(
  referredUserId: string
) {
  const { data: referral, error } =
    await supabaseAdmin
      .from("referrals")
      .select("*")
      .eq("referred_user_id", referredUserId)
      .maybeSingle();

  if (error) {
    console.error(
      "Find Referral For Conversion Error:",
      error
    );

    throw new Error(
      "Unable to find referral."
    );
  }

  if (!referral) {
    return null;
  }

  // Already converted.
  if (referral.status === "converted") {
    return referral;
  }

  const { data, error: updateError } =
    await supabaseAdmin
      .from("referrals")
      .update({
        status: "converted",
        converted_at: new Date().toISOString(),
      })
      .eq("id", referral.id)
      .select("*")
      .single();

  if (updateError) {
    console.error(
      "Convert Referral Error:",
      updateError
    );

    throw new Error(
      "Unable to update referral."
    );
  }

  // Increase successful referrals atomically.
  const { error: incrementError } =
    await supabaseAdmin.rpc(
      "increment_successful_referrals",
      {
        affiliate_uuid: referral.affiliate_id,
      }
    );

  if (incrementError) {
    console.error(
      "Increment Successful Referrals Error:",
      incrementError
    );
  }

  return data;
}

