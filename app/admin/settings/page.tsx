import AdminSettingsForm from "@/components/admin/AdminSettingsForm";

export default function AdminSettingsPage() {
  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-white">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold">
            Admin Settings
          </h1>

          <p className="mt-2 text-slate-400">
            Configure SONET AI STUDIO global settings.
          </p>
        </div>

        <AdminSettingsForm />
      </div>
    </main>
  );
}