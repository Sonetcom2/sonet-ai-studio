"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

type PlanName = "FREE" | "PRO" | "PREMIUM";

type PlanInfo = {
  price: number;
  credits: number;
};

type CheckoutClientProps = {
  plans: Record<PlanName, PlanInfo>;
};

function formatNaira(amount: number) {
  return `₦${amount.toLocaleString("en-NG")}`;
}

export default function CheckoutClient({
  plans,
}: CheckoutClientProps) {
  const searchParams = useSearchParams();

  const requestedPlan =
    searchParams.get("plan")?.toUpperCase() as PlanName | null;

  const plan: PlanName =
    requestedPlan && plans[requestedPlan]
      ? requestedPlan
      : "FREE";

  const selected = plans[plan];

  const [loading, setLoading] = useState(false);
  const [customerNote, setCustomerNote] = useState("");
  const [manualSubmitted, setManualSubmitted] = useState(false);
  const [manualReference, setManualReference] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleManualPayment = async () => {
    if (plan === "FREE") {
      alert("You're already on the FREE plan.");
      return;
    }

    if (!customerNote.trim()) {
      setErrorMessage(
        "Please enter your bank transfer reference or transaction ID."
      );
      return;
    }

    setLoading(true);
    setErrorMessage("");

    try {
      const response = await fetch("/api/manual-payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          plan,
          customerNote: customerNote.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.error || "Unable to submit manual payment."
        );
      }

      setManualReference(data.payment?.reference || "");
      setManualSubmitted(true);
    } catch (error: unknown) {
      console.error("Manual payment submission error:", error);

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to submit manual payment."
      );
    } finally {
      setLoading(false);
    }
  };

  if (manualSubmitted) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-black px-6 py-20 text-white">
        <div className="mx-auto max-w-3xl">
          <div className="rounded-3xl border border-slate-700 bg-slate-900 p-8 shadow-2xl sm:p-10">
            <div className="text-center">
              <div className="text-6xl">✓</div>

              <h1 className="mt-5 text-3xl font-black sm:text-4xl">
                Payment Request Submitted
              </h1>

              <p className="mt-4 text-slate-400">
                Your bank transfer payment request has been
                submitted successfully.
              </p>
            </div>

            <div className="mt-10 rounded-2xl border border-yellow-500/30 bg-yellow-500/10 p-6">
              <h2 className="text-xl font-bold text-yellow-300">
                Awaiting Admin Confirmation
              </h2>

              <p className="mt-3 text-sm leading-6 text-slate-300">
                Your subscription will remain pending until an
                administrator confirms your bank transfer.
                Please do not submit another payment request
                for the same transfer.
              </p>
            </div>

            <div className="mt-6 space-y-4 rounded-2xl border border-slate-700 bg-slate-800 p-6">
              <div className="flex flex-col gap-1 sm:flex-row sm:justify-between">
                <span className="text-slate-400">
                  Plan
                </span>

                <span className="font-bold text-cyan-400">
                  {plan}
                </span>
              </div>

              <div className="flex flex-col gap-1 sm:flex-row sm:justify-between">
                <span className="text-slate-400">
                  Amount
                </span>

                <span className="font-bold text-white">
                  {formatNaira(selected.price)}
                </span>
              </div>

              {manualReference && (
                <div className="flex flex-col gap-1 sm:flex-row sm:justify-between">
                  <span className="text-slate-400">
                    Payment Reference
                  </span>

                  <span className="break-all font-mono text-sm text-cyan-300 sm:text-right">
                    {manualReference}
                  </span>
                </div>
              )}

              <div className="flex flex-col gap-1 sm:flex-row sm:justify-between">
                <span className="text-slate-400">
                  Status
                </span>

                <span className="font-bold text-yellow-300">
                  PENDING
                </span>
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-slate-700 bg-slate-800 p-6">
              <h2 className="text-xl font-bold text-white">
                Bank Transfer Details
              </h2>

              <div className="mt-5 space-y-4">
                <div className="flex flex-col gap-1 sm:flex-row sm:justify-between">
                  <span className="text-slate-400">
                    Bank
                  </span>

                  <span className="font-bold text-white">
                    Providus Bank
                  </span>
                </div>

                <div className="flex flex-col gap-1 sm:flex-row sm:justify-between">
                  <span className="text-slate-400">
                    Account Name
                  </span>

                  <span className="font-bold text-white">
                    Sonetcom Digital Hub
                  </span>
                </div>

                <div className="flex flex-col gap-1 sm:flex-row sm:justify-between">
                  <span className="text-slate-400">
                    Account Number
                  </span>

                  <span className="font-mono text-xl font-bold tracking-wider text-cyan-400">
                    9617511804
                  </span>
                </div>

                <div className="flex flex-col gap-1 sm:flex-row sm:justify-between">
                  <span className="text-slate-400">
                    Amount
                  </span>

                  <span className="font-bold text-white">
                    {formatNaira(selected.price)}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-cyan-500/20 bg-cyan-500/10 p-5">
              <p className="text-sm leading-6 text-slate-300">
                Please keep your bank transfer receipt or
                transaction reference. An administrator will
                verify the payment before your {plan}{" "}
                subscription and credits are activated.
              </p>
            </div>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <Link
                href="/dashboard"
                className="flex-1 rounded-xl bg-cyan-600 px-6 py-3 text-center font-bold text-white transition hover:bg-cyan-700"
              >
                Go to Dashboard
              </Link>

              <Link
                href="/pricing"
                className="flex-1 rounded-xl bg-slate-700 px-6 py-3 text-center font-bold text-white transition hover:bg-slate-600"
              >
                Back to Pricing
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-black px-6 py-20 text-white">
      <div className="mx-auto max-w-3xl">
        <div className="rounded-3xl border border-slate-700 bg-slate-900 p-8 shadow-2xl sm:p-10">
          <h1 className="text-center text-4xl font-black sm:text-5xl">
            Checkout
          </h1>

          <p className="mt-4 text-center text-gray-400">
            You're about to upgrade your account.
          </p>

          <div className="mt-10 space-y-5 rounded-2xl border border-slate-700 bg-slate-800 p-6">
            <div className="flex justify-between gap-4">
              <span className="text-slate-400">
                Selected Plan
              </span>

              <span className="font-bold text-cyan-400">
                {plan}
              </span>
            </div>

            <div className="flex justify-between gap-4">
              <span className="text-slate-400">
                Credits
              </span>

              <span className="font-semibold">
                {selected.credits.toLocaleString("en-NG")}
              </span>
            </div>

            <div className="flex justify-between gap-4 border-t border-slate-700 pt-5 text-2xl font-black sm:text-3xl">
              <span>Total</span>

              <span>{formatNaira(selected.price)}</span>
            </div>
          </div>

          {plan !== "FREE" && (
            <div className="mt-8">
              <div className="rounded-2xl border border-green-500/20 bg-green-500/5 p-6">
                <h2 className="text-xl font-bold text-white">
                  🏦 Bank Transfer
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-400">
                  Transfer exactly the amount shown below to
                  the account and then submit your transfer
                  reference or transaction ID.
                </p>

                <div className="mt-5 space-y-4 rounded-xl bg-slate-800 p-5">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-slate-500">
                      Bank
                    </p>

                    <p className="mt-1 font-bold text-white">
                      Providus Bank
                    </p>
                  </div>

                  <div>
                    <p className="text-xs uppercase tracking-wider text-slate-500">
                      Account Name
                    </p>

                    <p className="mt-1 font-bold text-white">
                      Sonetcom Digital Hub
                    </p>
                  </div>

                  <div>
                    <p className="text-xs uppercase tracking-wider text-slate-500">
                      Account Number
                    </p>

                    <p className="mt-1 font-mono text-2xl font-black tracking-wider text-cyan-400">
                      9617511804
                    </p>
                  </div>

                  <div>
                    <p className="text-xs uppercase tracking-wider text-slate-500">
                      Amount to Transfer
                    </p>

                    <p className="mt-1 text-2xl font-black text-green-400">
                      {formatNaira(selected.price)}
                    </p>
                  </div>
                </div>

                <label className="mt-6 block">
                  <span className="text-sm font-semibold text-slate-300">
                    Transfer Reference / Transaction ID
                  </span>

                  <textarea
                    value={customerNote}
                    onChange={(event) =>
                      setCustomerNote(event.target.value)
                    }
                    maxLength={1000}
                    rows={4}
                    placeholder="Enter your bank transfer reference, transaction ID, or useful payment note..."
                    className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
                  />

                  <div className="mt-2 text-right text-xs text-slate-500">
                    {customerNote.length}/1000
                  </div>
                </label>

                {errorMessage && (
                  <div className="mt-5 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
                    {errorMessage}
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleManualPayment}
                  disabled={loading || !customerNote.trim()}
                  className="mt-5 w-full rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 py-4 text-xl font-bold transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading
                    ? "Submitting Payment Request..."
                    : "🏦 I Have Made the Bank Transfer"}
                </button>

                <p className="mt-4 text-center text-xs leading-5 text-slate-500">
                  Your account will not be upgraded until
                  the payment is verified and approved by an
                  administrator.
                </p>
              </div>
            </div>
          )}

          {plan === "FREE" && (
            <div className="mt-10 rounded-2xl border border-slate-700 bg-slate-800 p-6 text-center">
              <p className="text-slate-300">
                You're already on the FREE plan.
              </p>

              <Link
                href="/pricing"
                className="mt-5 inline-block rounded-xl bg-cyan-600 px-6 py-3 font-bold text-white transition hover:bg-cyan-700"
              >
                Back to Pricing
              </Link>
            </div>
          )}

          <Link
            href="/pricing"
            className="mt-8 block text-center text-cyan-400 hover:underline"
          >
            ← Back to Pricing
          </Link>
        </div>
      </div>
    </main>
  );
}