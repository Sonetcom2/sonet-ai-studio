export default function AdminSettingsPage() {
  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-white">
      <div className="mx-auto max-w-7xl">

        <div className="mb-8">
          <h1 className="text-4xl font-bold">
            ⚙️ Admin Settings
          </h1>

          <p className="mt-2 text-slate-400">
            Configure SONET AI STUDIO administration settings.
          </p>
        </div>

        <div className="rounded-3xl border border-slate-700 bg-slate-900 p-10 shadow-2xl">
          <div className="text-center">
            <div className="mb-4 text-6xl">⚙️</div>

            <h2 className="text-2xl font-bold">
              Settings Management
            </h2>

            <p className="mt-3 text-slate-400">
              Admin settings will be connected here.
            </p>
          </div>
        </div>

      </div>
    </main>
  );
}