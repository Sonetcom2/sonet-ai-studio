"use client";

import Link from "next/link";
import { useState } from "react";
import Logo from "./Logo";
import { useAuth } from "./providers/AuthProvider";

export default function Navbar() {
  const { user, loading } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const closeMenu = () => {
    setMobileMenuOpen(false);
  };

  const username =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email?.split("@")[0] ||
    "User";

  /*
   * DESKTOP NAVIGATION FRAME
   * The border is intentionally strong and permanent.
   */
  const navItem =
    "flex items-center justify-center whitespace-nowrap rounded-xl border-2 border-slate-700 bg-slate-900 px-4 py-2.5 text-sm font-semibold text-slate-200 shadow-md transition-all duration-200 hover:border-blue-400 hover:bg-slate-800 hover:text-white active:scale-105";

  /*
   * MOBILE NAVIGATION FRAME
   */
  const mobileItem =
    "flex w-full items-center rounded-xl border-2 border-slate-700 bg-slate-900 px-4 py-4 font-semibold text-white transition-all duration-200 active:scale-[1.03] active:border-blue-400";

  return (
    <nav className="relative z-50 w-full border-b border-white/10 bg-black">
      <div className="mx-auto flex min-h-[96px] max-w-[1800px] items-center px-4">

        {/* LOGO */}
        <div className="shrink-0">
          <Logo />
        </div>

        {/* ===================================================== */}
        {/* DESKTOP NAVIGATION */}
        {/* ===================================================== */}

        <div className="ml-auto hidden items-center gap-2 xl:flex">

          {loading ? (
            <div className="rounded-xl border-2 border-slate-700 bg-slate-900 px-4 py-2.5 text-sm text-slate-400">
              Loading...
            </div>
          ) : user ? (
            <>
              <Link href="/" className={navItem}>
                Home
              </Link>

              <Link href="/dashboard" className={navItem}>
                Dashboard
              </Link>

              <Link href="/ai-image" className={navItem}>
                AI Image
              </Link>

              <Link href="/ai-video" className={navItem}>
                AI Video
              </Link>

              <Link href="/my-images" className={navItem}>
                My Images
              </Link>

              <Link href="/prompt-library" className={navItem}>
                Prompt Library
              </Link>

              <Link href="/pricing" className={navItem}>
                Pricing
              </Link>

              <Link href="/about" className={navItem}>
                About
              </Link>

              <Link href="/contact" className={navItem}>
                Contact
              </Link>

              {/* USER FRAME */}
              <div className="flex items-center whitespace-nowrap rounded-xl border-2 border-cyan-400 bg-cyan-500/10 px-4 py-2.5 text-sm font-bold text-cyan-300 shadow-md">
                {username}
              </div>

              {/* LOGOUT FRAME */}
              <button
                type="button"
                onClick={async () => {
                  const { createClient } = await import(
                    "@/lib/supabase/client"
                  );

                  const supabase = createClient();

                  await supabase.auth.signOut();

                  window.location.href = "/";
                }}
                className="flex items-center whitespace-nowrap rounded-xl border-2 border-red-400 bg-red-500/10 px-4 py-2.5 text-sm font-bold text-red-300 shadow-md transition-all duration-200 hover:bg-red-500/20 active:scale-105"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/" className={navItem}>
                Home
              </Link>

              <Link href="/pricing" className={navItem}>
                Pricing
              </Link>

              <Link href="/about" className={navItem}>
                About
              </Link>

              <Link href="/contact" className={navItem}>
                Contact
              </Link>

              <Link
                href="/login"
                className="flex items-center justify-center whitespace-nowrap rounded-xl border-2 border-blue-500 bg-blue-500/10 px-5 py-2.5 font-semibold text-white shadow-md transition-all duration-200 hover:bg-blue-600/30 active:scale-105"
              >
                Sign In
              </Link>

              <Link
                href="/register"
                className="flex items-center justify-center whitespace-nowrap rounded-xl border-2 border-indigo-400 bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2.5 font-semibold text-white shadow-md transition-all duration-200 hover:brightness-110 active:scale-105"
              >
                Register
              </Link>
            </>
          )}
        </div>

        {/* ===================================================== */}
        {/* MOBILE MENU BUTTON */}
        {/* ===================================================== */}

        <button
          type="button"
          aria-label={
            mobileMenuOpen
              ? "Close navigation menu"
              : "Open navigation menu"
          }
          aria-expanded={mobileMenuOpen}
          onClick={() => setMobileMenuOpen((current) => !current)}
          className="ml-auto flex h-14 w-14 items-center justify-center rounded-xl border-2 border-slate-600 bg-slate-900 text-2xl font-bold text-white shadow-lg transition-all duration-200 hover:border-blue-400 hover:bg-slate-800 active:scale-110 xl:hidden"
        >
          {mobileMenuOpen ? "✕" : "☰"}
        </button>
      </div>

      {/* ===================================================== */}
      {/* MOBILE NAVIGATION */}
      {/* ===================================================== */}

      {mobileMenuOpen && (
        <div className="border-t border-white/10 bg-black px-4 py-4 xl:hidden">
          <div className="mx-auto flex max-w-[1800px] flex-col gap-3">

            {loading ? (
              <div className="rounded-xl border-2 border-slate-700 bg-slate-900 px-4 py-4 text-slate-400">
                Loading...
              </div>
            ) : user ? (
              <>
                <Link
                  href="/"
                  onClick={closeMenu}
                  className={mobileItem}
                >
                  🏠 Home
                </Link>

                <Link
                  href="/dashboard"
                  onClick={closeMenu}
                  className={mobileItem}
                >
                  📊 Dashboard
                </Link>

                <Link
                  href="/ai-image"
                  onClick={closeMenu}
                  className={mobileItem}
                >
                  🎨 AI Image
                </Link>

                <Link
                  href="/ai-video"
                  onClick={closeMenu}
                  className={mobileItem}
                >
                  🎬 AI Video
                </Link>

                <Link
                  href="/my-images"
                  onClick={closeMenu}
                  className={mobileItem}
                >
                  🖼️ My Images
                </Link>

                <Link
                  href="/prompt-library"
                  onClick={closeMenu}
                  className={mobileItem}
                >
                  📚 Prompt Library
                </Link>

                <Link
                  href="/pricing"
                  onClick={closeMenu}
                  className={mobileItem}
                >
                  💳 Pricing
                </Link>

                <Link
                  href="/about"
                  onClick={closeMenu}
                  className={mobileItem}
                >
                  ℹ️ About
                </Link>

                <Link
                  href="/contact"
                  onClick={closeMenu}
                  className={mobileItem}
                >
                  📩 Contact
                </Link>

                <div className="my-1 border-t border-white/10" />

                {/* USER */}
                <div className="rounded-xl border-2 border-cyan-400 bg-cyan-500/10 px-4 py-4 font-bold text-cyan-300">
                  👤 {username}
                </div>

                {/* LOGOUT */}
                <button
                  type="button"
                  onClick={async () => {
                    const { createClient } = await import(
                      "@/lib/supabase/client"
                    );

                    const supabase = createClient();

                    await supabase.auth.signOut();

                    closeMenu();

                    window.location.href = "/";
                  }}
                  className="w-full rounded-xl border-2 border-red-400 bg-red-500/10 px-4 py-4 text-left font-bold text-red-300 transition-all duration-200 active:scale-[1.03]"
                >
                  🚪 Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/"
                  onClick={closeMenu}
                  className={mobileItem}
                >
                  🏠 Home
                </Link>

                <Link
                  href="/pricing"
                  onClick={closeMenu}
                  className={mobileItem}
                >
                  💳 Pricing
                </Link>

                <Link
                  href="/about"
                  onClick={closeMenu}
                  className={mobileItem}
                >
                  ℹ️ About
                </Link>

                <Link
                  href="/contact"
                  onClick={closeMenu}
                  className={mobileItem}
                >
                  📩 Contact
                </Link>

                <div className="my-1 border-t border-white/10" />

                <Link
                  href="/login"
                  onClick={closeMenu}
                  className="flex w-full items-center justify-center rounded-xl border-2 border-blue-500 bg-blue-500/10 px-4 py-4 font-bold text-white transition-all duration-200 active:scale-[1.03]"
                >
                  Sign In
                </Link>

                <Link
                  href="/register"
                  onClick={closeMenu}
                  className="flex w-full items-center justify-center rounded-xl border-2 border-indigo-400 bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-4 font-bold text-white transition-all duration-200 active:scale-[1.03]"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}