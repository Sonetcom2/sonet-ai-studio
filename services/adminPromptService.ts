import { supabaseAdmin } from "@/lib/supabase/admin";

export type AdminPrompt = {
id: string;
userId: string;
userName: string;
userEmail: string;
title: string;
prompt: string;
};

export async function getAdminPrompts() {
const { data, error } = await supabaseAdmin
.from("saved_prompts")
.select(`       id,
      user_id,
      title,
      prompt
    `)
.order("id", {
ascending: false,
});

if (error) {
console.error(
"Admin Prompt Library Error:",
error
);

throw error;

}

const prompts = data ?? [];

if (prompts.length === 0) {
return [];
}

const userIds = [
...new Set(
prompts
.map((item) => item.user_id)
.filter(Boolean)
),
];

let profiles: {
id: string;
full_name: string | null;
email: string | null;
}[] = [];

if (userIds.length > 0) {
const { data: profileData, error: profileError } =
await supabaseAdmin
.from("profiles")
.select(`           id,
          full_name,
          email
        `)
.in("id", userIds);

if (profileError) {
  console.error(
    "Admin Prompt Profile Lookup Error:",
    profileError
  );
} else {
  profiles = profileData ?? [];
}

}

const profileMap = new Map(
profiles.map((profile) => [
profile.id,
profile,
])
);

return prompts.map((item) => {
const profile = profileMap.get(item.user_id);

return {
  id: item.id,
  userId: item.user_id,
  userName:
    profile?.full_name ?? "Unknown User",
  userEmail:
    profile?.email ?? "Unknown Email",
  title: item.title ?? "",
  prompt: item.prompt ?? "",
};


}) as AdminPrompt[];
}

export async function deleteAdminPrompt(
promptId: string
) {
if (!promptId) {
throw new Error("Prompt ID is required.");
}

const { error } = await supabaseAdmin
.from("saved_prompts")
.delete()
.eq("id", promptId);

if (error) {
console.error(
"Admin Delete Prompt Error:",
error
);


throw error;

}

return true;
}
