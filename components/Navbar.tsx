"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

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
  const [menuOpen, setMenuOpen] = useState(false);

  const displayName =
    user?.name ||
    user?.email?.split("@")[0] ||
    "Guest";

  function closeMenu() {
    setMenuOpen(false);
  }

  return (
    <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 lg:px-6">

        {/* SONET Logo */}
        <Link
          href="/"
          onClick={closeMenu}
          className="flex shrink-0 items-center gap-2"
        >
          <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl bg-slate-900 shadow-lg">
            <img
              src="/sonet-ai-studio-logo.png"
              alt="SONET AI STUDIO"
              className="h-full w-full object-contain"
            />
          </div>

          <div>
            <div className="text-lg font-bold text-white">
              SONET
            </div>

            <div className="text-[10px] font-medium tracking-[0.2em] text-cyan-400">
              AI STUDIO
            </div>
          </div>
        </Link>

        {/* Menu Button */}
        <button
          type="button"
          onClick={() => setMenuOpen((current) => !current)}
          aria-expanded={menuOpen}
          aria-label="Toggle navigation menu"
          className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:border-cyan-500 hover:bg-slate-800"
        >
          <span className="text-lg">
            {menuOpen ? "✕" : "☰"}
          </span>

          <span>
            {menuOpen ? "Close" : "Menu"}
          </span>
        </button>
      </div>

      {/* Single Menu Box */}
      {menuOpen && (
        <div className="border-t border-slate-800 bg-slate-950">
          <div className="mx-auto max-w-2xl px-4 py-5 lg:px-6">

            <div className="overflow-hidden rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl">

              {/* Menu Header */}
              <div className="border-b border-slate-700 bg-slate-900/80 px-5 py-4">
                <h2 className="text-lg font-bold text-white">
                  SONET AI STUDIO
                </h2>

                <p className="mt-1 text-sm text-slate-400">
                  Navigation Menu
                </p>
              </div>

              {/* Scrollable Menu Content */}
              <div className="max-h-[70vh] overflow-y-auto">

                {/* Navigation Items */}
                <div className="space-y-1 p-3">
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
                        onClick={closeMenu}
                        className={`flex items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-medium transition ${
                          isActive
                            ? "bg-cyan-500/15 text-cyan-400 ring-1 ring-cyan-500/30"
                            : "text-slate-300 hover:bg-slate-800 hover:text-white"
                        }`}
                      >
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-800 text-lg">
                          {item.icon}
                        </span>

                        <span>{item.label}</span>

                        {isActive && (
                          <span className="ml-auto h-2 w-2 rounded-full bg-cyan-400" />
                        )}
                      </Link>
                    );
                  })}
                </div>

                {/* Account Section */}
                <div className="border-t border-slate-700 p-3">
                  <div className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Account
                  </div>

                  <div className="space-y-1">

                    {/* User Account */}
                    <Link
                      href="/profile"
                      onClick={closeMenu}
                      className={`flex items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-medium transition ${
                        pathname === "/profile"
                          ? "bg-cyan-500/15 text-cyan-400 ring-1 ring-cyan-500/30"
                          : "text-slate-300 hover:bg-slate-800 hover:text-white"
                      }`}
                    >
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-cyan-500/10 text-lg">
                        👤
                      </span>

                      <div className="min-w-0">
                        <div className="font-medium">
                          User account
                        </div>

                        <div className="max-w-[220px] truncate text-xs text-slate-500">
                          {displayName}
                        </div>
                      </div>
                    </Link>

                    {/* Logout */}
                    <form
                      action="/api/logout"
                      method="POST"
                      className="w-full"
                    >
                      <button
                        type="submit"
                        className="flex w-full items-center gap-3 rounded-xl px-4 py-3.5 text-left text-sm font-medium text-red-300 transition hover:bg-red-500/10 hover:text-red-200"
                      >
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-500/10 text-lg">
                          🚪
                        </span>

                        <span>Logout</span>
                      </button>
                    </form>

                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}