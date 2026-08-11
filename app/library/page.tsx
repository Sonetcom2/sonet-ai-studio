import LibraryGrid from "@/components/prompt-builder/LibraryGrid";

export default function LibraryPage() {
  return (
    <main className="min-h-screen bg-slate-950 p-8">

      <div className="mx-auto max-w-7xl">

        <div className="mb-10">
          <h1 className="text-4xl font-bold text-white">
            📚 My Library
          </h1>

          <p className="mt-2 text-slate-400">
            Browse, preview, download and manage your AI creations.
          </p>
        </div>

        <LibraryGrid />

      </div>

    </main>
  );
}