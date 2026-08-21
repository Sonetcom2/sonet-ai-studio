"use client";

import { useMemo, useState } from "react";

export type AdminPromptItem = {
id: string;
userId: string;
userName: string;
userEmail: string;
title: string;
prompt: string;
};

type Props = {
prompts: AdminPromptItem[];
};

export default function PromptManagement({
prompts: initialPrompts,
}: Props) {
const [prompts, setPrompts] =
useState<AdminPromptItem[]>(initialPrompts);

const [search, setSearch] = useState("");
const [copiedId, setCopiedId] =
useState<string | null>(null);
const [deletingId, setDeletingId] =
useState<string | null>(null);

const filteredPrompts = useMemo(() => {
const query = search.trim().toLowerCase();


if (!query) {
  return prompts;
}

return prompts.filter((item) =>
  [
    item.title,
    item.prompt,
    item.userName,
    item.userEmail,
    item.userId,
  ]
    .join(" ")
    .toLowerCase()
    .includes(query)
);


}, [prompts, search]);

async function copyPrompt(item: AdminPromptItem) {
try {
await navigator.clipboard.writeText(item.prompt);


  setCopiedId(item.id);

  setTimeout(() => {
    setCopiedId(null);
  }, 1500);
} catch (error) {
  console.error("Copy Prompt Error:", error);
}


}

async function deletePrompt(item: AdminPromptItem) {
const confirmed = window.confirm(
`Delete "${item.title || "Untitled Prompt"}"?\n\nThis action cannot be undone.`
);


if (!confirmed) {
  return;
}

try {
  setDeletingId(item.id);

  const response = await fetch(
    "/api/admin/prompts",
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: item.id,
      }),
    }
  );

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(
      data.error || "Failed to delete prompt."
    );
  }

  setPrompts((current) =>
    current.filter(
      (prompt) => prompt.id !== item.id
    )
  );
} catch (error) {
  console.error("Delete Prompt Error:", error);

  window.alert(
    error instanceof Error
      ? error.message
      : "Failed to delete prompt."
  );
} finally {
  setDeletingId(null);
}


}

return (
<> <div className="grid gap-6 md:grid-cols-3"> <div className="rounded-2xl border border-slate-700 bg-slate-900 p-6"> <p className="text-sm text-slate-400">
Total Prompts </p>


      <p className="mt-2 text-3xl font-bold text-white">
        {prompts.length}
      </p>
    </div>

    <div className="rounded-2xl border border-slate-700 bg-slate-900 p-6">
      <p className="text-sm text-slate-400">
        Search Results
      </p>

      <p className="mt-2 text-3xl font-bold text-white">
        {filteredPrompts.length}
      </p>
    </div>

    <div className="rounded-2xl border border-slate-700 bg-slate-900 p-6">
      <p className="text-sm text-slate-400">
        Data Source
      </p>

      <p className="mt-2 text-xl font-semibold text-white">
        Supabase
      </p>
    </div>
  </div>

  <div className="overflow-hidden rounded-3xl border border-slate-700 bg-slate-900 shadow-2xl">
    <div className="border-b border-slate-700 px-6 py-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">
            Saved Prompts
          </h2>

          <p className="mt-1 text-sm text-slate-400">
            Manage prompts created by SONET AI STUDIO users.
          </p>
        </div>

        <input
          type="search"
          value={search}
          onChange={(event) =>
            setSearch(event.target.value)
          }
          placeholder="Search prompts, users, or emails..."
          className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-blue-500 lg:w-96"
        />
      </div>
    </div>

    {filteredPrompts.length === 0 ? (
      <div className="px-6 py-16 text-center">
        <div className="text-5xl">✨</div>

        <h3 className="mt-4 text-xl font-semibold text-white">
          {prompts.length === 0
            ? "No saved prompts yet"
            : "No prompts found"}
        </h3>

        <p className="mt-2 text-slate-400">
          {prompts.length === 0
            ? "User-created prompts will appear here automatically."
            : "Try a different search term."}
        </p>
      </div>
    ) : (
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="border-b border-slate-700 bg-slate-950/60">
            <tr>
              <th className="px-6 py-4 text-sm font-semibold text-slate-300">
                Prompt
              </th>

              <th className="px-6 py-4 text-sm font-semibold text-slate-300">
                User
              </th>

              <th className="px-6 py-4 text-sm font-semibold text-slate-300">
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-800">
            {filteredPrompts.map((item) => (
              <tr
                key={item.id}
                className="transition hover:bg-slate-800/40"
              >
                <td className="max-w-2xl px-6 py-5">
                  <div className="font-semibold text-white">
                    {item.title || "Untitled Prompt"}
                  </div>

                  <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-slate-400">
                    {item.prompt}
                  </p>

                  <div className="mt-3 text-xs text-slate-600">
                    ID: {item.id}
                  </div>
                </td>

                <td className="px-6 py-5">
                  <div className="font-medium text-white">
                    {item.userName}
                  </div>

                  <div className="mt-1 text-sm text-slate-400">
                    {item.userEmail}
                  </div>
                </td>

                <td className="px-6 py-5">
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => copyPrompt(item)}
                      className="rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-sm font-medium text-white hover:bg-slate-700"
                    >
                      {copiedId === item.id
                        ? "Copied"
                        : "Copy"}
                    </button>

                    <button
                      type="button"
                      onClick={() => deletePrompt(item)}
                      disabled={
                        deletingId === item.id
                      }
                      className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm font-medium text-red-300 hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {deletingId === item.id
                        ? "Deleting..."
                        : "Delete"}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </div>
</>

);
}
