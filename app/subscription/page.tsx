"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

type Profile = {
  full_name: string;
  plan: string;
  credits: number;
};

export default function SubscriptionPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      const supabase = createClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      const { data } = await supabase
        .from("profiles")
        .select("full_name, plan, credits")
        .eq("id", user.id)
        .single();

      if (data) {
        setProfile(data);
      }

      setLoading(false);
    }

    loadProfile();
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
        Loading Subscription...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-black text-white p-8">

      <div className="max-w-4xl mx-auto">

        <h1 className="text-5xl font-black mb-3">
          👑 My Subscription
        </h1>

        <p className="text-gray-400 mb-10">
          Manage your SONET AI STUDIO subscription.
        </p>

        <div className="rounded-3xl bg-slate-900 border border-slate-700 p-10 shadow-2xl">

          <div className="grid md:grid-cols-2 gap-8">

            <div className="rounded-2xl bg-slate-800 p-6">

              <h2 className="text-gray-400 mb-2">
                Current Plan
              </h2>

              <p className="text-4xl font-black text-cyan-400">
                {profile?.plan ?? "FREE"}
              </p>

            </div>

            <div className="rounded-2xl bg-slate-800 p-6">

              <h2 className="text-gray-400 mb-2">
                Credits Remaining
              </h2>

              <p className="text-4xl font-black text-green-400">
                {profile?.credits ?? 0}
              </p>

            </div>

            <div className="rounded-2xl bg-slate-800 p-6">

              <h2 className="text-gray-400 mb-2">
                Status
              </h2>

              <p className="text-3xl font-bold text-green-400">
                Active
              </p>

            </div>

            <div className="rounded-2xl bg-slate-800 p-6">

              <h2 className="text-gray-400 mb-2">
                Account Holder
              </h2>

              <p className="text-2xl font-semibold">
                {profile?.full_name}
              </p>

            </div>

          </div>

          <div className="grid md:grid-cols-3 gap-4 mt-10">

            <Link
              href="/pricing"
              className="rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 py-4 text-center font-bold hover:scale-105 transition"
            >
              ⬆ Upgrade Plan
            </Link>

            <Link
              href="/billing"
              className="rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 py-4 text-center font-bold hover:scale-105 transition"
            >
              💳 Billing History
            </Link>

            <Link
              href="/profile"
              className="rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 py-4 text-center font-bold hover:scale-105 transition"
            >
              ⚙ Account Settings
            </Link>

          </div>

        </div>

      </div>

    </main>
  );
}