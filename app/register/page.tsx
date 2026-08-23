"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

declare global {
  interface Window {
    fbq?: (
      command: string,
      eventName: string,
      parameters?: Record<string, unknown>
    ) => void;
  }
}

export default function RegisterPage() {
  const supabase = createClient();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [referralCode, setReferralCode] = useState("");

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    try {
      const params = new URLSearchParams(
        window.location.search
      );

      const ref = params.get("ref");

      if (ref) {
        setReferralCode(
          ref.trim().toUpperCase()
        );
      }
    } catch (error) {
      console.error(
        "Referral code detection error:",
        error
      );
    }
  }, []);

  async function handleSubmit(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    if (!fullName || !email || !password) {
      alert("Please fill in all fields.");
      return;
    }

    if (password.length < 6) {
      alert(
        "Password must be at least 6 characters long."
      );
      return;
    }

    setLoading(true);

    try {
      const signupMetadata: {
        full_name: string;
        referral_code?: string;
      } = {
        full_name: fullName.trim(),
      };

      if (referralCode) {
        signupMetadata.referral_code =
          referralCode;
      }

      const { data, error } =
        await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: signupMetadata,
          },
        });

      if (error) {
        alert(error.message);
        return;
      }

      if (!data.user) {
        alert(
          "Unable to create your account. Please try again."
        );
        return;
      }

      // Meta conversion tracking:
      // Fire only after Supabase successfully creates the user.
      if (
        typeof window !== "undefined" &&
        window.fbq
      ) {
        window.fbq(
          "track",
          "CompleteRegistration"
        );
      }

      /*
       * If Supabase returns a session immediately,
       * we can process the referral now.
       *
       * If email confirmation is enabled and there is
       * no session, the referral code remains safely
       * stored in the user's auth metadata and can be
       * processed after authentication.
       */
      if (referralCode && data.session) {
        try {
          const referralResponse = await fetch(
            "/api/referrals/register",
            {
              method: "POST",
              headers: {
                "Content-Type":
                  "application/json",
              },
              body: JSON.stringify({
                referralCode,
              }),
            }
          );

          if (!referralResponse.ok) {
            console.error(
              "Referral registration failed:",
              await referralResponse.text()
            );
          }
        } catch (referralError) {
          console.error(
            "Referral processing error:",
            referralError
          );
        }
      }

      alert(
        "🎉 Account created successfully!\n\nPlease check your email and verify your account before signing in."
      );

      setFullName("");
      setEmail("");
      setPassword("");
      setReferralCode("");
    } catch (error) {
      console.error(
        "Registration error:",
        error
      );

      alert(
        error instanceof Error
          ? error.message
          : "Unable to create your account right now."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-black flex items-center justify-center px-6">
      <div className="w-full max-w-md rounded-3xl bg-slate-900/70 border border-blue-500/30 p-8 shadow-2xl backdrop-blur-md">

        <h1 className="text-4xl font-black text-center text-white">
          Create Account
        </h1>

        <p className="text-center text-gray-400 mt-3">
          Join SONET AI STUDIO
        </p>

        {referralCode && (
          <div className="mt-6 rounded-xl border border-yellow-500/30 bg-yellow-500/10 px-4 py-3 text-center">
            <p className="text-sm text-yellow-300">
              🎉 You were referred by a SONET
              affiliate.
            </p>

            <p className="mt-1 text-xs font-semibold text-yellow-400">
              Referral: {referralCode}
            </p>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="mt-8 space-y-5"
        >
          <input
            type="text"
            placeholder="Full Name"
            value={fullName}
            onChange={(e) =>
              setFullName(e.target.value)
            }
            autoComplete="name"
            required
            className="w-full rounded-xl bg-slate-800 border border-slate-700 px-4 py-3 text-white outline-none focus:border-cyan-500"
          />

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
            autoComplete="new-password"
            minLength={6}
            required
            className="w-full rounded-xl bg-slate-800 border border-slate-700 px-4 py-3 text-white outline-none focus:border-cyan-500"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 py-3 font-bold text-white transition hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading
              ? "Creating Account..."
              : "Create Account"}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-gray-400">
            Already have an account?
          </p>

          <Link
            href="/login"
            className="text-cyan-400 hover:text-cyan-300 font-semibold"
          >
            Sign In
          </Link>
        </div>
      </div>
    </main>
  );
}