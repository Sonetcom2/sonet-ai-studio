import Link from "next/link";

export default function GuestMenu() {
  return (
    <>
      <Link
        href="/"
        className="hover:text-blue-400 transition"
      >
        Home
      </Link>

      <Link
        href="/pricing"
        className="hover:text-blue-400 transition"
      >
        Pricing
      </Link>

      <Link
        href="/about"
        className="hover:text-blue-400 transition"
      >
        About
      </Link>

      <Link
        href="/contact"
        className="hover:text-blue-400 transition"
      >
        Contact
      </Link>

      <Link
        href="/login"
        className="px-5 py-2 rounded-xl border border-blue-500 hover:bg-blue-600 transition"
      >
        Sign In
      </Link>

      <Link
        href="/register"
        className="bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2 rounded-xl hover:scale-105 transition duration-300 shadow-lg"
      >
        Register
      </Link>
    </>
  );
}