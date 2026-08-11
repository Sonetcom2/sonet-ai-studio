import { createClient } from "@/lib/supabase/server";

export async function getAllUsers() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
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
  lastLogin: user.last_login,
}));
  const stats = {
    totalUsers: users.length,

    activeUsers: users.filter(
      (user) => user.status !== "suspended"
    ).length,

    suspendedUsers: users.filter(
      (user) => user.status === "suspended"
    ).length,

    premiumUsers: users.filter(
      (user) =>
        user.plan === "premium" ||
        user.plan === "pro"
    ).length,
  };

  return {
    users,
    stats,
  };
}