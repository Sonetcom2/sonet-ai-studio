"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function AdminNavbar() {
  const router = useRouter();
  const supabase = createClient();

  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    if (loggingOut) return;

    setLoggingOut(true);

    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error("Admin logout error:", error);
        alert("Unable to log out. Please try again.");
        return;
      }

      router.replace("/admin/login");
      router.refresh();
    } catch (error) {
      console.error("Admin logout error:", error);
      alert("Unable to log out. Please try again.");
    } finally {
      setLoggingOut(false);
    }
  }

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

        <button
          type="button"
          aria-label="Notifications"
          className="relative rounded-2xl bg-slate-900 p-3 transition hover:bg-slate-800"
        >
          🔔
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500" />
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

          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            className="ml-2 rounded-xl border border-red-500/30 px-4 py-2 text-sm font-semibold text-red-300 transition hover:bg-red-500/10 hover:text-red-200 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loggingOut ? "Logging out..." : "Logout"}
          </button>

        </div>

      </div>

    </header>
  );
}