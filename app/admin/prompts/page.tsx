import AdminLayout from "@/components/admin/AdminLayout";
import PromptManagement from "@/components/admin/PromptManagement";
import {
  getAdminPrompts,
  AdminPrompt,
} from "@/services/adminPromptService";

export default async function AdminPromptsPage() {
let prompts: AdminPrompt[] = [];
let error = "";
try {
prompts = await getAdminPrompts();
} catch (err) {
console.error(
"Admin Prompts Page Error:",
err
);


error =
  "Unable to load the prompt library.";


}

return ( <AdminLayout> <div className="space-y-8">


    <div>
      <h1 className="text-4xl font-bold text-white">
        ✨ Prompt Management
      </h1>

      <p className="mt-3 text-slate-400">
        Manage saved prompts created by SONET AI STUDIO users.
      </p>
    </div>

    {error && (
      <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-5 text-red-300">
        {error}
      </div>
    )}

    <PromptManagement prompts={prompts} />

  </div>
</AdminLayout>


);
}