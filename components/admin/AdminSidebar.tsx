"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const menuItems = [
  {
    title: "Dashboard",
    href: "/admin/dashboard",
    icon: "📊",
  },
  {
    title: "Users",
    href: "/admin/users",
    icon: "👥",
  },
  {
    title: "Images",
    href: "/admin/images",
    icon: "🖼",
  },
  {
    title: "Videos",
    href: "/admin/videos",
    icon: "🎥",
  },
  {
    title: "Payments",
    href: "/admin/payments",
    icon: "💳",
  },
  {
    title: "Subscriptions",
    href: "/admin/subscriptions",
    icon: "💎",
  },
  {
    title: "Prompt Library",
    href: "/admin/prompts",
    icon: "📚",
  },
  {
    title: "Analytics",
    href: "/admin/analytics",
    icon: "📈",
  },
  {
    title: "Settings",
    href: "/admin/settings",
    icon: "⚙️",
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-72 flex-col border-r border-slate-800 bg-slate-950">

      <div className="border-b border-slate-800 p-8">

        <h1 className="text-2xl font-black text-white">
          👑 SONET AI
        </h1>

        <p className="mt-2 text-sm text-slate-400">
          Admin Control Panel
        </p>

      </div>

      <nav className="flex-1 space-y-2 p-5">

        {menuItems.map((item) => {

          const active = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-4 rounded-2xl px-5 py-4 transition-all duration-300 ${
                active
                  ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <span className="text-2xl">
                {item.icon}
              </span>

              <span className="font-semibold">
                {item.title}
              </span>
            </Link>
          );
        })}

      </nav>

      <div className="border-t border-slate-800 p-5">

        <div className="rounded-2xl bg-slate-900 p-4">

          <p className="text-sm text-slate-400">
            Platform
          </p>

          <h2 className="mt-2 text-lg font-bold text-white">
            SONET AI STUDIO
          </h2>

          <p className="mt-1 text-xs text-slate-500">
            Admin Version 1.0
          </p>

        </div>

      </div>

    </aside>
  );
}