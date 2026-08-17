"use client";

type LibraryToolbarProps = {
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
}: LibraryToolbarProps) {
  return (
    <div className="mb-8 rounded-3xl border border-slate-700 bg-slate-900/70 p-6 shadow-xl">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="relative">
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
            🔍
          </span>

          <input
            type="text"
            placeholder="Search your prompts..."
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            className="w-full rounded-xl border border-slate-700 bg-slate-800 py-3 pl-11 pr-4 text-white outline-none transition focus:border-purple-500"
          />
        </div>

        <select
          value={sort}
          onChange={(event) =>
            setSort(event.target.value)
          }
          className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none focus:border-purple-500"
        >
          <option value="newest">
            Newest First
          </option>

          <option value="oldest">
            Oldest First
          </option>

          <option value="az">
            Prompt A-Z
          </option>

          <option value="za">
            Prompt Z-A
          </option>
        </select>
      </div>
    </div>
  );
}