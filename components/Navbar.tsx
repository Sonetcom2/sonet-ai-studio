"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type NavbarProps = {
  user?: {
    email?: string | null;
    name?: string | null;
  } | null;
};

const navItems = [
  {
    href: "/",
    label: "Home",
    icon: "🏠",
  },
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: "📊",
  },
  {
    href: "/ai-assistant",
    label: "AI Assistant",
    icon: "🤖",
  },
  {
    href: "/ai-image",
    label: "AI Image",
    icon: "🎨",
  },
  {
    href: "/ai-video",
    label: "AI Video",
    icon: "🎬",
  },
  {
    href: "/my-images",
    label: "My Images",
    icon: "🖼️",
  },
  {
    href: "/my-videos",
    label: "My Videos",
    icon: "🎥",
  },
  {
    href: "/prompt-library",
    label: "Prompt Library",
    icon: "📚",
  },
  {
    href: "/pricing",
    label: "Pricing",
    icon: "💳",
  },
  {
    href: "/about",
    label: "About",
    icon: "ℹ️",
  },
  {
    href: "/contact",
    label: "Contact",
    icon: "📩",
  },
];

export default function Navbar({ user }: NavbarProps) {
  const pathname = usePathname();

  const displayName =
    user?.name ||
    user?.email?.split("@")[0] ||
    "Guest";

  return (
    <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 lg:px-6">

        {/* Logo */}
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 text-lg font-bold text-white shadow-lg">
            S
          </div>

          <div className="hidden sm:block">
            <div className="text-lg font-bold text-white">
              SONET
            </div>

            <div className="text-[10px] font-medium tracking-[0.2em] text-cyan-400">
              AI STUDIO
            </div>
          </div>
        </Link>

        {/* Navigation */}
        <nav className="hidden items-center gap-1 xl:flex">
          {navItems.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname === item.href ||
                  pathname.startsWith(
                    `${item.href}/`
                  );

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                  isActive
                    ? "bg-cyan-500/15 text-cyan-400"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <span className="mr-1">
                  {item.icon}
                </span>

                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User */}
        <div className="flex items-center gap-3">
          <Link
            href="/profile"
            className="hidden items-center gap-2 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 transition hover:border-cyan-500 md:flex"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-cyan-500/20 text-sm">
              👤
            </span>

            <span className="max-w-[120px] truncate text-sm font-medium text-white">
              {displayName}
            </span>
          </Link>

          <form action="/api/logout" method="POST">
            <button
              type="submit"
              className="rounded-lg border border-slate-700 px-3 py-2 text-sm font-medium text-slate-300 transition hover:border-red-500 hover:bg-red-500/10 hover:text-red-300"
            >
              🚪 Logout
            </button>
          </form>
        </div>
      </div>

      {/* Mobile navigation */}
      <div className="border-t border-slate-800 xl:hidden">
        <nav className="flex gap-1 overflow-x-auto px-4 py-2">
          {navItems.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname === item.href ||
                  pathname.startsWith(
                    `${item.href}/`
                  );

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex shrink-0 items-center gap-1 rounded-lg px-3 py-2 text-xs font-medium transition ${
                  isActive
                    ? "bg-cyan-500/15 text-cyan-400"
                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}