import { supabaseAdmin } from "@/lib/supabase/admin";

export const IMAGE_GENERATION_COST = 10;

export const VIDEO_GENERATION_COST = 50;

export async function getUserCredits(userId: string) {
  const { data, error } = await supabaseAdmin
    .from("profiles")
    .select("credits, plan")
    .eq("id", userId)
    .single();

  if (error || !data) {
    throw new Error("Unable to fetch user credits.");
  }

  return {
    credits: Number(data.credits ?? 0),
    plan: data.plan,
  };
}

export async function deductCredits(
  userId: string,
  amount: number
) {
  if (amount <= 0) {
    throw new Error("Credit amount must be greater than zero.");
  }

  const { data: profile, error: profileError } =
    await supabaseAdmin
      .from("profiles")
      .select("credits")
      .eq("id", userId)
      .single();

  if (profileError || !profile) {
    throw new Error("Profile not found.");
  }

  const currentCredits = Number(profile.credits ?? 0);

  if (currentCredits < amount) {
    throw new Error("Insufficient credits.");
  }

  const newCredits = currentCredits - amount;

  const { error: updateError } =
    await supabaseAdmin
      .from("profiles")
      .update({
        credits: newCredits,
      })
      .eq("id", userId);

  if (updateError) {
    throw new Error("Unable to deduct credits.");
  }

  return newCredits;
}

export async function addCredits(
  userId: string,
  amount: number
) {
  if (amount <= 0) {
    throw new Error("Credit amount must be greater than zero.");
  }

  const { data: profile, error: profileError } =
    await supabaseAdmin
      .from("profiles")
      .select("credits")
      .eq("id", userId)
      .single();

  if (profileError || !profile) {
    throw new Error("Profile not found.");
  }

  const currentCredits = Number(profile.credits ?? 0);

  const newCredits = currentCredits + amount;

  const { error: updateError } =
    await supabaseAdmin
      .from("profiles")
      .update({
        credits: newCredits,
        
      })
      .eq("id", userId);

  if (updateError) {
    throw new Error("Unable to add credits.");
  }

  return newCredits;
}