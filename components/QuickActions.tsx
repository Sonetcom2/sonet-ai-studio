"use client";

import Link from "next/link";

const actions = [
  {
    title: "Generate Image",
    description: "Create AI images from prompts",
    href: "/ai-image",
    icon: "🎨",
    color: "from-cyan-500 to-blue-600",
    button: "Create Image",
  },
  {
    title: "AI Video Studio",
    description: "Generate cinematic AI videos",
    href: "/ai-video",
    icon: "🎥",
    color: "from-orange-500 to-red-600",
    button: "Create Video",
  },
  {
    title: "Prompt Builder",
    description: "Build professional AI prompts",
    href: "/prompt-builder",
    icon: "✨",
    color: "from-purple-500 to-pink-600",
    button: "Build Prompt",
  },
  {
    title: "My Library",
    description: "View your generated images",
    href: "/library",
    icon: "🖼",
    color: "from-emerald-500 to-green-600",
    button: "Open Library",
  },
  {
    title: "Buy Credits",
    description: "Add credits to your SONET account",
    href: "/pricing",
    icon: "💎",
    color: "from-yellow-500 to-amber-600",
    button: "Get Credits",
  },
  {
    title: "Account Settings",
    description: "Manage your profile and account",
    href: "/profile",
    icon: "⚙️",
    color: "from-slate-500 to-slate-700",
    button: "Manage Account",
  },
];

export default function QuickActions() {
  return (
    <section className="mb-12">

      {/* Header */}
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-white">
          🚀 Quick Actions
        </h2>

        <p className="mt-2 text-slate-400">
          Access your most frequently used SONET AI STUDIO tools.
        </p>
      </div>

      {/* Actions */}
      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">

        {actions.map((action) => (
          <Link
            key={action.title}
            href={action.href}
            className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl transition-all duration-300 hover:-translate-y-2 hover:border-cyan-400/40 hover:shadow-[0_0_40px_rgba(34,211,238,0.15)]"
          >

            {/* Top gradient */}
            <div
              className={`h-1.5 bg-gradient-to-r ${action.color}`}
            />

            <div className="p-6">

              {/* Icon */}
              <div
                className={`mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${action.color} text-3xl shadow-lg transition-transform duration-300 group-hover:scale-110`}
              >
                {action.icon}
              </div>

              {/* Title */}
              <h3 className="text-xl font-bold text-white transition-colors group-hover:text-cyan-300">
                {action.title}
              </h3>

              {/* Description */}
              <p className="mt-2 min-h-[48px] text-sm leading-6 text-slate-400">
                {action.description}
              </p>

              {/* Action */}
              <div className="mt-6 flex items-center justify-between">

                <span className="font-semibold text-cyan-400">
                  {action.button}
                </span>

                <span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-cyan-400 transition-all duration-300 group-hover:translate-x-1 group-hover:border-cyan-400/40">
                  →
                </span>

              </div>

            </div>

          </Link>
        ))}

      </div>

    </section>
  );
}