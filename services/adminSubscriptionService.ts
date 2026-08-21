import { supabaseAdmin } from "@/lib/supabase/admin";

export type AdminSubscriptionUser = {
  id: string;
  fullName: string;
  email: string;
  plan: string;
  credits: number;
  status: string;
  role: string;
  createdAt: string;
  lastLogin: string | null;
};

export async function getAdminSubscriptions() {
  const { data, error } = await supabaseAdmin
    .from("profiles")
    .select(`
      id,
      full_name,
      email,
      plan,
      credits,
      status,
      role,
      created_at,
      last_login
    `)
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    console.error(
      "Admin Subscriptions Error:",
      error
    );

    throw error;
  }

  const users: AdminSubscriptionUser[] =
    (data ?? []).map((user) => ({
      id: user.id,
      fullName: user.full_name ?? "",
      email: user.email ?? "",
      plan: user.plan ?? "FREE",
      credits: user.credits ?? 0,
      status: user.status ?? "ACTIVE",
      role: user.role ?? "USER",
      createdAt: user.created_at ?? "",
      lastLogin: user.last_login ?? null,
    }));

  return users;
}

export function getSubscriptionStats(
  users: AdminSubscriptionUser[]
) {
  return {
    total: users.length,

    free: users.filter(
      (user) =>
        user.plan.toUpperCase() === "FREE"
    ).length,

    pro: users.filter(
      (user) =>
        user.plan.toUpperCase() === "PRO"
    ).length,

    premium: users.filter(
      (user) =>
        user.plan.toUpperCase() === "PREMIUM"
    ).length,

    active: users.filter(
      (user) =>
        user.status.toUpperCase() === "ACTIVE"
    ).length,

    suspended: users.filter(
      (user) =>
        user.status.toUpperCase() === "SUSPENDED"
    ).length,
  };
}