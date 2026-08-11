import { createClient } from "@/lib/supabase/server";

type UpdateUserData = {
  id: string;
  fullName: string;
  role: string;
  plan: string;
  status: string;
  credits: number;
};

export async function updateUser(data: UpdateUserData) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: data.fullName,
      role: data.role,
      plan: data.plan,
      status: data.status,
      credits: data.credits,
    })
    .eq("id", data.id);

  if (error) {
    console.error("Update User Error:", error);
    throw error;
  }

  return true;
}