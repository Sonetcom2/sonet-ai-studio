import "server-only";

import { supabaseAdmin } from "@/lib/supabase/admin";

export type AdminWithdrawalAffiliate = {
  referral_code: string;
  user_id: string;
};

export type AdminWithdrawal = {
  id: string;
  affiliate_id: string;
  user_id: string;
  amount: number;
  currency: string;
  bank_name: string;
  account_name: string;
  account_number: string;
  status: string;
  reference: string;
  admin_note: string | null;
  requested_at: string;
  processed_at: string | null;
  paid_at: string | null;
  created_at: string;
  updated_at: string;

  affiliate_profiles: AdminWithdrawalAffiliate | null;
};

function normalizeAffiliateProfile(
  profile:
    | AdminWithdrawalAffiliate
    | AdminWithdrawalAffiliate[]
    | null
    | undefined
): AdminWithdrawalAffiliate | null {
  if (!profile) {
    return null;
  }

  if (Array.isArray(profile)) {
    return profile[0] ?? null;
  }

  return profile;
}

export async function getAllWithdrawals(): Promise<
  AdminWithdrawal[]
> {
  const { data, error } = await supabaseAdmin
    .from("affiliate_withdrawals")
    .select(`
      id,
      affiliate_id,
      user_id,
      amount,
      currency,
      bank_name,
      account_name,
      account_number,
      status,
      reference,
      admin_note,
      requested_at,
      processed_at,
      paid_at,
      created_at,
      updated_at,
      affiliate_profiles (
        referral_code,
        user_id
      )
    `)
    .order("requested_at", {
      ascending: false,
    });

  if (error) {
    console.error(
      "Get Admin Withdrawals Error:",
      error
    );

    throw new Error(
      "Unable to load withdrawal requests."
    );
  }

  return (data ?? []).map((withdrawal) => ({
    id: withdrawal.id,
    affiliate_id: withdrawal.affiliate_id,
    user_id: withdrawal.user_id,
    amount: Number(withdrawal.amount),
    currency: withdrawal.currency,
    bank_name: withdrawal.bank_name,
    account_name: withdrawal.account_name,
    account_number: withdrawal.account_number,
    status: withdrawal.status,
    reference: withdrawal.reference,
    admin_note: withdrawal.admin_note,
    requested_at: withdrawal.requested_at,
    processed_at: withdrawal.processed_at,
    paid_at: withdrawal.paid_at,
    created_at: withdrawal.created_at,
    updated_at: withdrawal.updated_at,

    affiliate_profiles:
      normalizeAffiliateProfile(
        withdrawal.affiliate_profiles
      ),
  }));
}

export async function getWithdrawalById(
  withdrawalId: string
): Promise<AdminWithdrawal | null> {
  const { data, error } = await supabaseAdmin
    .from("affiliate_withdrawals")
    .select(`
      id,
      affiliate_id,
      user_id,
      amount,
      currency,
      bank_name,
      account_name,
      account_number,
      status,
      reference,
      admin_note,
      requested_at,
      processed_at,
      paid_at,
      created_at,
      updated_at,
      affiliate_profiles (
        referral_code,
        user_id
      )
    `)
    .eq("id", withdrawalId)
    .maybeSingle();

  if (error) {
    console.error(
      "Get Withdrawal By ID Error:",
      error
    );

    throw new Error(
      "Unable to load withdrawal request."
    );
  }

  if (!data) {
    return null;
  }

  return {
    id: data.id,
    affiliate_id: data.affiliate_id,
    user_id: data.user_id,
    amount: Number(data.amount),
    currency: data.currency,
    bank_name: data.bank_name,
    account_name: data.account_name,
    account_number: data.account_number,
    status: data.status,
    reference: data.reference,
    admin_note: data.admin_note,
    requested_at: data.requested_at,
    processed_at: data.processed_at,
    paid_at: data.paid_at,
    created_at: data.created_at,
    updated_at: data.updated_at,

    affiliate_profiles:
      normalizeAffiliateProfile(
        data.affiliate_profiles
      ),
  };
}