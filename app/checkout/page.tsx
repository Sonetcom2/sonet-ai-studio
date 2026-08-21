
import { Suspense } from "react";
import { getSettings } from "@/services/settingsService";
import CheckoutClient from "@/components/checkout/CheckoutClient";

export default async function CheckoutPage() {
  const settings = await getSettings();

  const plans = {
    FREE: {
      price: 0,
      credits: settings.free_credits,
    },
    PRO: {
      price: settings.pro_price,
      credits: settings.pro_credits,
    },
    PREMIUM: {
      price: settings.premium_price,
      credits: settings.premium_credits,
    },
  };

  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-black text-white flex items-center justify-center">
          <div className="text-center">
            <div className="text-2xl font-bold">
              Loading checkout...
            </div>

            <p className="text-gray-400 mt-2">
              Please wait while we prepare your checkout.
            </p>
          </div>
        </main>
      }
    >
      <CheckoutClient plans={plans} />
    </Suspense>
  );
}