import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-black border-t border-gray-800 mt-20">
      <div className="max-w-7xl mx-auto px-6 py-14">

        <div className="grid md:grid-cols-3 gap-10">

          <div>
            <h2 className="text-2xl font-bold text-blue-400">
              SONET AI STUDIO
            </h2>

            <p className="mt-4 text-gray-400">
              Making Life Lite through Artificial Intelligence.
            </p>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">
              Quick Links
            </h3>

            <div className="space-y-2 text-gray-400">

              <Link href="/">Home</Link><br />

              <Link href="/pricing">Pricing</Link><br />

              <Link href="/about">About</Link><br />

              <Link href="/contact">Contact</Link>

            </div>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">
              Contact
            </h3>

            <p className="text-gray-400">
              supportsonetaistudio@gmail.com
            </p>

            <p className="text-gray-400 mt-2">
              Nigeria
            </p>
          </div>

        </div>

        <div className="border-t border-gray-800 mt-10 pt-6 text-center text-gray-500">
          © 2026 SONETCOM DIGITAL HUB. All rights reserved.
        </div>

      </div>
    </footer>
  );
}