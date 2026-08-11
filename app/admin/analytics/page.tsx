export default function AdminAnalyticsPage() {
  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-white">
      <div className="mx-auto max-w-7xl">

        <div className="mb-8">
          <h1 className="text-4xl font-bold">
            📊 Analytics
          </h1>

          <p className="mt-2 text-slate-400">
            Monitor platform activity and performance.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">

          <div className="rounded-3xl border border-slate-700 bg-slate-900 p-8">
            <p className="text-sm text-slate-400">
              Total Users
            </p>

            <p className="mt-3 text-4xl font-black text-white">
              —
            </p>
          </div>

          <div className="rounded-3xl border border-slate-700 bg-slate-900 p-8">
            <p className="text-sm text-slate-400">
              Images Generated
            </p>

            <p className="mt-3 text-4xl font-black text-white">
              —
            </p>
          </div>

          <div className="rounded-3xl border border-slate-700 bg-slate-900 p-8">
            <p className="text-sm text-slate-400">
              Revenue
            </p>

            <p className="mt-3 text-4xl font-black text-white">
              —
            </p>
          </div>

        </div>

        <div className="mt-8 rounded-3xl border border-slate-700 bg-slate-900 p-10">
          <div className="text-center">

            <div className="mb-4 text-6xl">
              📈
            </div>

            <h2 className="text-2xl font-bold">
              Analytics Dashboard
            </h2>

            <p className="mt-3 text-slate-400">
              Detailed analytics and charts will be connected here.
            </p>

          </div>
        </div>

      </div>
    </main>
  );
}