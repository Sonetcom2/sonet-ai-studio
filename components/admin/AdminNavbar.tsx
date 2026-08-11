"use client";

export default function AdminNavbar() {
  return (
    <header className="sticky top-0 z-20 flex h-20 items-center justify-between border-b border-slate-800 bg-slate-950/80 px-8 backdrop-blur-xl">

      <div>
        <h1 className="text-3xl font-black text-white">
          Admin Dashboard
        </h1>

        <p className="mt-1 text-sm text-slate-400">
          Welcome back, Administrator
        </p>
      </div>

      <div className="flex items-center gap-6">

        <button className="relative rounded-2xl bg-slate-900 p-3 transition hover:bg-slate-800">
          🔔
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500"></span>
        </button>

        <div className="flex items-center gap-3 rounded-2xl border border-slate-700 bg-slate-900 px-4 py-2">

          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 text-xl font-bold">
            A
          </div>

          <div>
            <h3 className="font-semibold text-white">
              Administrator
            </h3>

            <p className="text-sm text-slate-400">
              Super Admin
            </p>
          </div>

        </div>

      </div>

    </header>
  );
}