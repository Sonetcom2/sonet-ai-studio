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

  const {

    data: existingReferral,

    error: existingError,

  } = await supabaseAdmin

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

  const {

    data: referral,

    error,

  } = await supabaseAdmin

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



  const {

    data,

    error: updateError,

  } = await supabaseAdmin

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



/**

 * Get the affiliate upline for a user.

 *

 * Returns up to 3 qualified levels:

 *

 * Level 1 = direct sponsor

 * Level 2 = sponsor's sponsor

 * Level 3 = third-level sponsor

 *

 * This function only follows the existing referral

 * relationships. It does not calculate commissions.

 */

export async function getAffiliateUpline(

  userId: string

) {

  const upline: Array<{

    level: 1 | 2 | 3;

    affiliateId: string;

    userId: string;

    referralId: string;

  }> = [];



  let currentUserId = userId;



  for (let level = 1; level <= 3; level++) {

    const {

      data: referral,

      error,

    } = await supabaseAdmin

      .from("referrals")

      .select(

        "id, affiliate_id, referred_user_id"

      )

      .eq(

        "referred_user_id",

        currentUserId

      )

      .maybeSingle();



    if (error) {

      console.error(

        `Get Affiliate Upline Level ${level} Error:`,

        error

      );



      throw new Error(

        "Unable to determine affiliate network."

      );

    }



    // No sponsor found.

    if (!referral) {

      break;

    }



    const {

      data: affiliate,

      error: affiliateError,

    } = await supabaseAdmin

      .from("affiliate_profiles")

      .select("id, user_id, status")

      .eq("id", referral.affiliate_id)

      .maybeSingle();



    if (affiliateError) {

      console.error(

        `Get Upline Affiliate Level ${level} Error:`,

        affiliateError

      );



      throw new Error(

        "Unable to load affiliate network."

      );

    }



    // Stop if the affiliate profile no longer exists.

    if (!affiliate) {

      break;

    }



    // Only active affiliates qualify for commissions.

    if (affiliate.status !== "active") {

      break;

    }



    upline.push({

      level: level as 1 | 2 | 3,

      affiliateId: affiliate.id,

      userId: affiliate.user_id,

      referralId: referral.id,

    });



    // Move upward through the network.

    currentUserId = affiliate.user_id;

  }



  return upline;

}



/**

 * Get the affiliate's referral network.

 *

 * Returns up to 3 levels:

 *

 * Level 1 = direct referrals

 * Level 2 = referrals of Level 1 members

 * Level 3 = referrals of Level 2 members

 *

 * This function only builds the referral network.

 * It does not calculate commissions.

 */

export async function getAffiliateNetwork(
  affiliateId: string
) {
  const COMMISSION_RATES = {
    1: 15,
    2: 3,
    3: 1,
  } as const;

  const network: Array<{
    level: 1 | 2 | 3;
    affiliateId: string;
    userId: string;
    referralId: string;
    referralCode: string;
    status: string;
    createdAt: string;
    convertedAt: string | null;
    commissionRate: number;
    commissionEarned: number;
    commissionCount: number;
  }> = [];

  const addCommissionData = async <
    T extends {
      level: 1 | 2 | 3;
      affiliateId: string;
      userId: string;
      referralId: string;
      referralCode: string;
      status: string;
      createdAt: string;
      convertedAt: string | null;
    }
  >(member: T) => {
    const commissionRate = COMMISSION_RATES[member.level];

    const { data: commissions, error: commissionError } =
      await supabaseAdmin
        .from("commissions")
        .select("commission_amount")
        .eq("affiliate_id", affiliateId)
        .eq("referred_user_id", member.userId);

    if (commissionError) {
      console.error(
        "Get Network Commission Error:",
        commissionError
      );

      throw new Error(
        "Unable to load affiliate commission data."
      );
    }

    const commissionEarned = (commissions ?? []).reduce(
      (total, commission) =>
        total + Number(commission.commission_amount ?? 0),
      0
    );

    return {
      ...member,
      commissionRate,
      commissionEarned,
      commissionCount: commissions?.length ?? 0,
    };
  };

  const getAffiliateByUserIdInternal = async (
    userId: string
  ) => {
    const { data, error } = await supabaseAdmin
      .from("affiliate_profiles")
      .select("id, user_id, referral_code, status")
      .eq("user_id", userId)
      .maybeSingle();

    if (error) {
      console.error(
        "Get Network Affiliate Profile Error:",
        error
      );

      throw new Error(
        "Unable to load affiliate network member."
      );
    }

    return data;
  };

  const { data: level1, error: level1Error } =
    await supabaseAdmin
      .from("referrals")
      .select(`
        id,
        affiliate_id,
        referred_user_id,
        referral_code,
        status,
        created_at,
        converted_at
      `)
      .eq("affiliate_id", affiliateId)
      .order("created_at", { ascending: false });

  if (level1Error) {
    console.error(
      "Get Affiliate Network Level 1 Error:",
      level1Error
    );

    throw new Error("Unable to load affiliate network.");
  }

  if (!level1 || level1.length === 0) {
    return network;
  }

  for (const referral of level1) {
    const referredAffiliate =
      await getAffiliateByUserIdInternal(
        referral.referred_user_id
      );

    network.push(
      await addCommissionData({
        level: 1,
        affiliateId: referredAffiliate?.id ?? "",
        userId: referral.referred_user_id,
        referralId: referral.id,
        referralCode: referral.referral_code,
        status: referral.status,
        createdAt: referral.created_at,
        convertedAt: referral.converted_at,
      })
    );
  }

  const level1UserIds = level1.map(
    (referral) => referral.referred_user_id
  );

  const { data: level1Affiliates, error: level1AffiliatesError } =
    await supabaseAdmin
      .from("affiliate_profiles")
      .select("id, user_id")
      .in("user_id", level1UserIds);

  if (level1AffiliatesError) {
    console.error(
      "Get Affiliate Network Level 2 Affiliates Error:",
      level1AffiliatesError
    );

    throw new Error("Unable to load affiliate network.");
  }

  const level1AffiliateIds =
    level1Affiliates?.map((affiliate) => affiliate.id) ?? [];

  if (level1AffiliateIds.length === 0) {
    return network;
  }

  const { data: level2, error: level2Error } =
    await supabaseAdmin
      .from("referrals")
      .select(`
        id,
        affiliate_id,
        referred_user_id,
        referral_code,
        status,
        created_at,
        converted_at
      `)
      .in("affiliate_id", level1AffiliateIds)
      .order("created_at", { ascending: false });

  if (level2Error) {
    console.error(
      "Get Affiliate Network Level 2 Error:",
      level2Error
    );

    throw new Error("Unable to load affiliate network.");
  }

  for (const referral of level2 ?? []) {
    const referredAffiliate =
      await getAffiliateByUserIdInternal(
        referral.referred_user_id
      );

    network.push(
      await addCommissionData({
        level: 2,
        affiliateId: referredAffiliate?.id ?? "",
        userId: referral.referred_user_id,
        referralId: referral.id,
        referralCode: referral.referral_code,
        status: referral.status,
        createdAt: referral.created_at,
        convertedAt: referral.converted_at,
      })
    );
  }

  const level2UserIds = (level2 ?? []).map(
    (referral) => referral.referred_user_id
  );

  if (level2UserIds.length === 0) {
    return network;
  }

  const { data: level2Affiliates, error: level2AffiliatesError } =
    await supabaseAdmin
      .from("affiliate_profiles")
      .select("id, user_id")
      .in("user_id", level2UserIds);

  if (level2AffiliatesError) {
    console.error(
      "Get Affiliate Network Level 3 Affiliates Error:",
      level2AffiliatesError
    );

    throw new Error("Unable to load affiliate network.");
  }

  const level2AffiliateIds =
    level2Affiliates?.map((affiliate) => affiliate.id) ?? [];

  if (level2AffiliateIds.length === 0) {
    return network;
  }

  const { data: level3, error: level3Error } =
    await supabaseAdmin
      .from("referrals")
      .select(`
        id,
        affiliate_id,
        referred_user_id,
        referral_code,
        status,
        created_at,
        converted_at
      `)
      .in("affiliate_id", level2AffiliateIds)
      .order("created_at", { ascending: false });

  if (level3Error) {
    console.error(
      "Get Affiliate Network Level 3 Error:",
      level3Error
    );

    throw new Error("Unable to load affiliate network.");
  }

  for (const referral of level3 ?? []) {
    const referredAffiliate =
      await getAffiliateByUserIdInternal(
        referral.referred_user_id
      );

    network.push(
      await addCommissionData({
        level: 3,
        affiliateId: referredAffiliate?.id ?? "",
        userId: referral.referred_user_id,
        referralId: referral.id,
        referralCode: referral.referral_code,
        status: referral.status,
        createdAt: referral.created_at,
        convertedAt: referral.converted_at,
      })
    );
  }

  return network;
}
