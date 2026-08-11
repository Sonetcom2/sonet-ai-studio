"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const supabase = createClient();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    if (!email || !password) {
      alert("Please enter your email and password.");
      return;
    }

    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
  email,
  password,
});

alert("USER:\n" + JSON.stringify(data.user, null, 2));

alert("SESSION:\n" + JSON.stringify(data.session, null, 2));

alert("ERROR:\n" + JSON.stringify(error, null, 2));

    setLoading(false);

    if (error) {
      alert(error.message);
      return;
    }

    alert("🎉 Welcome back!");

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-black flex items-center justify-center px-6">
      <div className="w-full max-w-md rounded-3xl bg-slate-900/70 border border-blue-500/30 p-8 shadow-2xl backdrop-blur-md">

        <h1 className="text-4xl font-black text-center text-white">
          Welcome Back
        </h1>

        <p className="text-center text-gray-400 mt-3">
          Sign in to SONET AI STUDIO
        </p>

        <form
          onSubmit={handleLogin}
          className="mt-8 space-y-5"
        >
          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
            className="w-full rounded-xl bg-slate-800 border border-slate-700 px-4 py-3 text-white outline-none focus:border-cyan-500"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
            className="w-full rounded-xl bg-slate-800 border border-slate-700 px-4 py-3 text-white outline-none focus:border-cyan-500"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 py-3 font-bold text-white transition hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Signing In..." : "Sign In"}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-gray-400">
            Don't have an account?
          </p>

          <Link
            href="/register"
            className="text-cyan-400 hover:text-cyan-300 font-semibold"
          >
            Create Account
          </Link>
        </div>

      </div>
    </main>
  );
}