"use client";

type Props = {
  search: string;
  setSearch: (value: string) => void;

  sort: string;
  setSort: (value: string) => void;
};

export default function LibraryToolbar({
  search,
  setSearch,
  sort,
  setSort,
}: Props) {
  return (
    <div className="mb-8 rounded-3xl border border-slate-700 bg-slate-900/70 p-6 shadow-xl">

      <div className="grid gap-4 md:grid-cols-2">

        <input
          type="text"
          placeholder="🔍 Search your prompts..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none focus:border-purple-500"
        />

        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white"
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="az">Prompt A-Z</option>
          <option value="za">Prompt Z-A</option>
        </select>

      </div>

    </div>
  );
}