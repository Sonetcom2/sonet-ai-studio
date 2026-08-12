"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

type Receipt = {
  plan: string;
  amount: number;
  status: string;
  reference: string;
  created_at: string;
};

function ReceiptContent() {
  const params = useSearchParams();

  const reference = params.get("reference");

  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadReceipt() {
      if (!reference) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `/api/receipt?reference=${encodeURIComponent(reference)}`
        );

        const data = await response.json();

        if (data.success) {
          setReceipt(data.receipt);
        }
      } finally {
        setLoading(false);
      }
    }

    loadReceipt();
  }, [reference]);

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
        Loading Receipt...
      </main>
    );
  }

  if (!receipt) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-950 text-red-400">
        Receipt not found.
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-black text-white p-8">
      <div className="max-w-2xl mx-auto rounded-3xl bg-slate-900 border border-slate-700 p-10 shadow-2xl">
        <h1 className="text-5xl font-black text-center">
          🧾 Receipt
        </h1>

        <p className="text-center text-gray-400 mt-3">
          SONET AI STUDIO
        </p>

        <div className="mt-10 space-y-5">
          <div className="flex justify-between">
            <span>Reference</span>
            <span>{receipt.reference}</span>
          </div>

          <div className="flex justify-between">
            <span>Plan</span>
            <span>{receipt.plan}</span>
          </div>

          <div className="flex justify-between">
            <span>Amount</span>
            <span>
              ₦{(receipt.amount / 100).toLocaleString()}
            </span>
          </div>

          <div className="flex justify-between">
            <span>Status</span>

            <span className="text-green-400 font-bold">
              {receipt.status}
            </span>
          </div>

          <div className="flex justify-between">
            <span>Date</span>

            <span>
              {new Date(receipt.created_at).toLocaleString()}
            </span>
          </div>
        </div>

        <button
          onClick={() => window.print()}
          className="mt-12 w-full rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 py-4 text-xl font-bold hover:scale-105 transition"
        >
          🖨 Print Receipt
        </button>
      </div>
    </main>
  );
}

function ReceiptLoading() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
      Loading Receipt...
    </main>
  );
}

export default function ReceiptPage() {
  return (
    <Suspense fallback={<ReceiptLoading />}>
      <ReceiptContent />
    </Suspense>
  );
}