"use client";

export default function UserSearch() {
  return (
    <div className="rounded-2xl border border-slate-700 bg-slate-900 p-6">

      <input
        type="text"
        placeholder="🔍 Search users..."
        className="w-full rounded-xl border border-slate-600 bg-slate-800 px-5 py-3 text-white outline-none focus:border-cyan-500"
      />

    </div>
  );
}