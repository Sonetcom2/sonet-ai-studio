"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

function LoginForm() {
  const supabase = createClient();
  const router = useRouter();
  const searchParams = useSearchParams();

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

    try {
      /*
       * Authenticate with Supabase.
       */
      const { data, error } =
        await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

      if (error) {
        alert(error.message);
        return;
      }

      /*
       * A successful login must contain both
       * the authenticated user and session.
       */
      if (!data.user || !data.session) {
        alert(
          "Unable to create a session. Please try again."
        );
        return;
      }

      /*
       * ========================================================
       * LOGIN SUCCESS NOTIFICATION
       * ========================================================
       */
      alert("Login successful!");

      /*
       * ========================================================
       * PROCESS REFERRAL CODE SAVED DURING REGISTRATION
       * ========================================================
       *
       * Email confirmation is enabled in Supabase.
       *
       * Therefore, during registration there may be no active
       * session, which means the referral registration endpoint
       * cannot be called at that time.
       *
       * The referral code is nevertheless saved in the user's
       * Supabase Auth metadata.
       *
       * After the user successfully logs in, we now process
       * that stored referral code.
       */
      const referralCode =
        data.user.user_metadata?.referral_code;

      if (
        typeof referralCode === "string" &&
        referralCode.trim()
      ) {
        try {
          const referralResponse = await fetch(
            "/api/referrals/register",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              credentials: "include",
              body: JSON.stringify({
                referralCode:
                  referralCode.trim().toUpperCase(),
              }),
            }
          );

          const referralResult =
            await referralResponse.json();

          if (!referralResult.success) {
            console.warn(
              "Referral registration was not completed:",
              referralResult.error
            );
          }
        } catch (referralError) {
          console.error(
            "Referral registration request failed:",
            referralError
          );
        }
      }

      /*
       * ========================================================
       * AFFILIATE DASHBOARD REDIRECT
       * ========================================================
       *
       * When the user came from the affiliate page,
       * send them directly to the affiliate dashboard
       * after successful authentication.
       */
      const redirect =
        searchParams.get("redirect");

      if (redirect === "affiliate") {
        router.push("/affiliate/dashboard");
      } else {
        router.push("/dashboard");
      }

      router.refresh();
    } catch (error) {
      console.error("Login error:", error);

      alert(
        error instanceof Error
          ? error.message
          : "Unable to sign in right now."
      );
    } finally {
      setLoading(false);
    }
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
            autoComplete="email"
            required
            className="w-full rounded-xl bg-slate-800 border border-slate-700 px-4 py-3 text-white outline-none focus:border-cyan-500"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
            autoComplete="current-password"
            required
            className="w-full rounded-xl bg-slate-800 border border-slate-700 px-4 py-3 text-white outline-none focus:border-cyan-500"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 py-3 font-bold text-white transition hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading
              ? "Signing In..."
              : "Sign In"}
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

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-black flex items-center justify-center px-6">
          <div className="text-center text-white">
            <div className="text-3xl">⚡</div>
            <p className="mt-3 text-gray-400">
              Loading...
            </p>
          </div>
        </main>
      }
    >
      <LoginForm />
    </Suspense>
  );
}