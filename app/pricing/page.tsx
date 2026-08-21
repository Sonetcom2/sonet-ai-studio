
import Link from "next/link";
import { getSettings } from "@/services/settingsService";

export default async function PricingPage() {
  const settings = await getSettings();

  const plans = [
    {
      name: "FREE",
      price: "₦0",
      description:
        "Try SONET AI STUDIO and explore essential AI tools.",
      credits: `${settings.free_credits} Credits / month`,
      features: [
        "SONET AI Assistant",
        "SONET Prompt Engineer",
        "Prompt Library",
        "AI Image Studio",
        "AI Video Studio",
        "AI Marketing Assistant",
        `${settings.free_credits} AI credits per month`,
        "Standard generation",
        "Basic downloads",
        "Community support",
      ],
      button: "Current Plan",
      color: "border-slate-700",
    },
    {
      name: "PRO",
      price: `₦${settings.pro_price.toLocaleString()} / month`,
      description:
        "Powerful AI tools for creators, freelancers and growing businesses.",
      credits: `${settings.pro_credits} Credits / month`,
      features: [
        "Everything in Free",
        "Full creative AI tools",
        "AI Image Studio",
        "AI Video Studio",
        "AI Voice Studio",
        "Marketing Assistant",
        `${settings.pro_credits} AI credits per month`,
        "HD generation",
        "HD downloads",
        "Reference image/video support",
        "Priority generation",
        "Priority support",
        "Commercial use",
      ],
      button: "Upgrade",
      color: "border-cyan-500",
      popular: true,
    },
    {
      name: "PREMIUM",
      price: `₦${settings.premium_price.toLocaleString()} / month`,
      description:
        "Maximum AI power for professionals, businesses and high-volume creators.",
      credits: `${settings.premium_credits} Credits / month`,
      features: [
        "Everything in Pro",
        `${settings.premium_credits} AI credits per month`,
        "Premium generation quality",
        "Premium video generation",
        "Highest generation priority",
        "Faster processing",
        "Advanced creative tools",
        "HD / premium downloads",
        "Reference image/video support",
        "Commercial and business use",
        "Premium priority support",
        "Early access to new AI tools",
      ],
      button: "Upgrade",
      color: "border-yellow-500",
    },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-black text-white py-16 px-8">
      <div className="max-w-7xl mx-auto">

        <div className="text-center mb-16">
          <h1 className="text-6xl font-black">
            Pricing Plans
          </h1>

          <p className="text-gray-400 mt-4 text-xl">
            Choose the SONET AI STUDIO plan that fits your creativity,
            content and business needs.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-3xl bg-slate-900 p-8 border-2 ${plan.color} shadow-xl hover:scale-105 transition duration-300`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-cyan-500 px-5 py-2 text-sm font-black text-white">
                  MOST POPULAR
                </div>
              )}

              <h2 className="text-4xl font-black">
                {plan.name}
              </h2>

              <p className="text-5xl font-black text-cyan-400 mt-6">
                {plan.price}
              </p>

              <p className="mt-3 text-gray-300">
                {plan.description}
              </p>

              <div className="mt-6 rounded-xl bg-slate-800 p-4">
                <p className="font-bold text-cyan-300">
                  {plan.credits}
                </p>
              </div>

              <ul className="mt-8 space-y-3">
                {plan.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-3"
                  >
                    <span className="text-green-400 font-bold">
                      ✓
                    </span>

                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <Link
                href={`/checkout?plan=${plan.name}`}
                className="block mt-10 text-center rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 py-3 font-bold hover:scale-105 transition"
              >
                {plan.button}
              </Link>
            </div>
          ))}
        </div>

      </div>
    </main>
  );
}