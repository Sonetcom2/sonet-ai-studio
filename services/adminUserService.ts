import { supabaseAdmin } from "@/lib/supabase/admin";

export async function getAllUsers() {
  const { data, error } = await supabaseAdmin
    .from("profiles")
    .select(
      `
      id,
      full_name,
      email,
      credits,
      plan,
      role,
      status,
      last_login,
      created_at
      `
    )
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Admin Users Error:", error);

    return {
      users: [],
      stats: {
        totalUsers: 0,
        activeUsers: 0,
        suspendedUsers: 0,
        premiumUsers: 0,
      },
    };
  }

  const users = (data ?? []).map((user) => ({
    id: user.id,
    fullName: user.full_name ?? "",
    email: user.email ?? "",
    plan: user.plan ?? "FREE",
    credits: user.credits ?? 0,
    createdAt: user.created_at ?? "",
    status: user.status ?? "ACTIVE",
    role: user.role ?? "USER",
    lastLogin: user.last_login ?? null,
  }));

  const stats = {
    totalUsers: users.length,

    activeUsers: users.filter(
      (user) =>
        user.status?.toUpperCase() === "ACTIVE"
    ).length,

    suspendedUsers: users.filter(
      (user) =>
        user.status?.toUpperCase() === "SUSPENDED"
    ).length,

    premiumUsers: users.filter(
      (user) => {
        const plan = user.plan?.toUpperCase();

        return (
          plan === "PREMIUM" ||
          plan === "PRO"
        );
      }
    ).length,
  };

  return {
    users,
    stats,
  };
}