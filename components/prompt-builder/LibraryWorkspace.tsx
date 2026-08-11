"use client";

import LibraryGrid from "./LibraryGrid";

export default function LibraryWorkspace() {
  return (
    <div className="rounded-3xl border border-slate-700 bg-slate-900/70 p-8 shadow-2xl backdrop-blur-xl">

      <div className="mb-8 flex items-center justify-between">

        <div>

          <h2 className="text-3xl font-bold text-white">
            📚 My Library
          </h2>

          <p className="mt-2 text-slate-400">
            Browse, preview, download and manage all your AI creations.
          </p>

        </div>

        <button
          onClick={() => window.location.reload()}
          className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700"
        >
          🔄 Refresh
        </button>

      </div>

      <LibraryGrid />

    </div>
  );
}