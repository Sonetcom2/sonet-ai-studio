"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

const planInfo = {
  FREE: {
    price: "₦0",
    credits: 100,
  },
  PRO: {
    price: "₦5,000",
    credits: 1000,
  },
  PREMIUM: {
    price: "₦25,000",
    credits: "Unlimited",
  },
};

function CheckoutContent() {
  const searchParams = useSearchParams();

  const plan =
    (searchParams.get("plan") as keyof typeof planInfo) || "FREE";

  const selected = planInfo[plan];

  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");

  const supabase = createClient();

  useEffect(() => {
    async function loadUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user?.email) {
        setEmail(user.email);
      }
    }

    loadUser();
  }, []);

  const handlePayment = async () => {
    if (plan === "FREE") {
      alert("You're already on the FREE plan.");
      return;
    }

    if (!email) {
      alert("Unable to load your account information.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "/api/flutterwave/initialize",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            plan,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.error ||
            "Unable to initialize Flutterwave payment."
        );
      }

      if (!data.checkoutUrl) {
        throw new Error(
          "Flutterwave did not return a checkout URL."
        );
      }

      window.location.href = data.checkoutUrl;
    } catch (error: unknown) {
      console.error(
        "Flutterwave payment initialization error:",
        error
      );

      alert(
        error instanceof Error
          ? error.message
          : "Unable to initialize payment."
      );

      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-black text-white">
      <div className="max-w-3xl mx-auto py-20 px-6">
        <div className="rounded-3xl bg-slate-900 border border-slate-700 p-10 shadow-2xl">
          <h1 className="text-5xl font-black text-center">
            Checkout
          </h1>

          <p className="text-center text-gray-400 mt-4">
            You're about to upgrade your account.
          </p>

          <div className="mt-12 space-y-6">
            <div className="flex justify-between">
              <span>Selected Plan</span>

              <span className="font-bold text-cyan-400">
                {plan}
              </span>
            </div>

            <div className="flex justify-between">
              <span>Credits</span>

              <span>{selected.credits}</span>
            </div>

            <div className="flex justify-between text-3xl font-black">
              <span>Total</span>

              <span>{selected.price}</span>
            </div>
          </div>

          <button
            onClick={handlePayment}
            disabled={loading}
            className="mt-12 w-full rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 py-4 text-xl font-bold hover:scale-105 transition disabled:opacity-50"
          >
            {loading
              ? "Opening Flutterwave..."
              : "💳 Continue to Payment"}
          </button>

          <Link
            href="/pricing"
            className="block mt-6 text-center text-cyan-400 hover:underline"
          >
            ← Back to Pricing
          </Link>
        </div>
      </div>
    </main>
  );
}

function CheckoutLoading() {
  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center">
      <p>Loading checkout...</p>
    </main>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<CheckoutLoading />}>
      <CheckoutContent />
    </Suspense>
  );
}