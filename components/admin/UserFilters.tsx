"use client";

export default function UserFilters() {
  return (
    <div className="flex flex-wrap gap-3">

      <button className="rounded-xl bg-cyan-600 px-5 py-2 text-white">
        All
      </button>

      <button className="rounded-xl bg-slate-800 px-5 py-2 text-slate-300 hover:bg-slate-700">
        Free
      </button>

      <button className="rounded-xl bg-slate-800 px-5 py-2 text-slate-300 hover:bg-slate-700">
        Pro
      </button>

      <button className="rounded-xl bg-slate-800 px-5 py-2 text-slate-300 hover:bg-slate-700">
        Premium
      </button>

      <button className="rounded-xl bg-slate-800 px-5 py-2 text-slate-300 hover:bg-slate-700">
        Suspended
      </button>

    </div>
  );
}