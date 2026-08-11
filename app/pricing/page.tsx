import Link from "next/link";

const plans = [
  {
    name: "FREE",
    price: "₦0",
    credits: "100 Credits",
    features: [
      "100 AI image credits",
      "Standard image generation",
      "Community support",
      "Basic downloads",
    ],
    button: "Current Plan",
    color: "border-slate-700",
  },
  {
    name: "PRO",
    price: "₦5,000 / month",
    credits: "1,000 Credits",
    features: [
      "1,000 AI image credits",
      "Priority generation",
      "HD downloads",
      "Priority support",
      "No daily limits",
    ],
    button: "Upgrade",
    color: "border-cyan-500",
  },
  {
    name: "PREMIUM",
    price: "₦25,000 / month",
    credits: "Unlimited Credits",
    features: [
      "Unlimited AI images",
      "Fastest generation",
      "4K downloads",
      "AI Video access",
      "Premium support",
      "Early access to new AI tools",
    ],
    button: "Upgrade",
    color: "border-yellow-500",
  },
];

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-black text-white py-16 px-8">

      <div className="max-w-7xl mx-auto">

        {/* Header */}

        <div className="text-center mb-16">

          <h1 className="text-6xl font-black">
            💳 Pricing Plans
          </h1>

          <p className="text-gray-400 mt-4 text-xl">
            Upgrade your SONET AI STUDIO experience and unlock more AI power.
          </p>

        </div>

        {/* Pricing Cards */}

        <div className="grid md:grid-cols-3 gap-8">

          {plans.map((plan) => (

            <div
              key={plan.name}
              className={`rounded-3xl bg-slate-900 p-8 border-2 ${plan.color} shadow-xl hover:scale-105 transition duration-300`}
            >

              <h2 className="text-4xl font-black">
                {plan.name}
              </h2>

              <p className="text-5xl font-black text-cyan-400 mt-6">
                {plan.price}
              </p>

              <p className="mt-3 text-gray-300">
                {plan.credits}
              </p>

              <ul className="mt-8 space-y-3">

                {plan.features.map((feature) => (

                  <li
                    key={feature}
                    className="flex items-center gap-3"
                  >

                    <span className="text-green-400">
                      ✔
                    </span>

                    <span>
                      {feature}
                    </span>

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