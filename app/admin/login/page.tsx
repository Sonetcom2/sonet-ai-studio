
"use client";

import { FormEvent, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function AdminLoginPage() {
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleLogin(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setErrorMessage("");

    const cleanEmail = email.trim();

    if (!cleanEmail || !password) {
      setErrorMessage(
        "Please enter your email and password."
      );
      return;
    }

    setLoading(true);

    try {
      /*
       * Authenticate with Supabase.
       */
      const { data, error } =
        await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
        });

      if (error) {
        console.error(
          "Admin login authentication error:",
          error
        );

        setErrorMessage(error.message);
        return;
      }

      /*
       * A successful login must contain both
       * the authenticated user and session.
       */
      if (!data.user || !data.session) {
        setErrorMessage(
          "Login succeeded but no authenticated session was created. Please try again."
        );
        return;
      }

      /*
       * Verify administrator role.
       */
      const { data: profile, error: profileError } =
        await supabase
          .from("profiles")
          .select("role")
          .eq("id", data.user.id)
          .single();

      if (profileError) {
        console.error(
          "Admin profile lookup error:",
          profileError
        );

        await supabase.auth.signOut();

        setErrorMessage(
          "Unable to verify administrator privileges."
        );

        return;
      }

      /*
       * Only ADMIN accounts may access the
       * administrator dashboard.
       */
      if (
        !profile ||
        String(profile.role).toUpperCase() !== "ADMIN"
      ) {
        await supabase.auth.signOut();

        setErrorMessage(
          "Access denied. This account does not have administrator privileges."
        );

        return;
      }

      /*
       * Authentication and administrator verification
       * succeeded.
       *
       * Use a full browser navigation instead of
       * router.refresh()/router.replace().
       *
       * This gives Supabase SSR middleware a completely
       * fresh request with the authentication cookies.
       */
      window.location.href = "/admin/dashboard";
    } catch (error) {
      console.error("Admin login error:", error);

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to sign in. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-blue-950 to-black px-6">
      <div className="w-full max-w-md rounded-3xl border border-cyan-500/20 bg-slate-900/90 p-8 shadow-2xl backdrop-blur-md">

        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 text-3xl shadow-lg">
            👑
          </div>

          <h1 className="text-4xl font-black text-white">
            Admin Login
          </h1>

          <p className="mt-3 text-gray-400">
            SONET AI STUDIO Control Center
          </p>
        </div>

        {/* Error */}
        {errorMessage && (
          <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {errorMessage}
          </div>
        )}

        {/* Login Form */}
        <form
          onSubmit={handleLogin}
          className="space-y-5"
        >
          <div>
            <label
              htmlFor="admin-email"
              className="mb-2 block text-sm font-medium text-slate-300"
            >
              Email Address
            </label>

            <input
              id="admin-email"
              type="email"
              placeholder="admin@example.com"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              autoComplete="email"
              required
              disabled={loading}
              className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-500 disabled:cursor-not-allowed disabled:opacity-60"
            />
          </div>

          <div>
            <label
              htmlFor="admin-password"
              className="mb-2 block text-sm font-medium text-slate-300"
            >
              Password
            </label>

            <input
              id="admin-password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
              autoComplete="current-password"
              required
              disabled={loading}
              className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-500 disabled:cursor-not-allowed disabled:opacity-60"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 py-3 font-bold text-white transition hover:scale-[1.02] hover:from-cyan-400 hover:to-blue-500 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
          >
            {loading
              ? "Authenticating..."
              : "Sign In as Administrator"}
          </button>
        </form>

        {/* Security Notice */}
        <div className="mt-8 rounded-xl border border-slate-700 bg-slate-950/70 p-4">
          <p className="text-center text-xs leading-5 text-slate-500">
            Administrator access is restricted to
            accounts with the{" "}
            <strong className="text-slate-400">
              ADMIN
            </strong>{" "}
            role.
          </p>
        </div>
      </div>
    </main>
  );
}
