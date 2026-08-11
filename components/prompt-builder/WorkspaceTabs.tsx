"use client";

export type WorkspaceTab =
  | "prompt"
  | "image"
  | "video"
  | "library";

type Props = {
  activeTab: WorkspaceTab;
  onChange: (tab: WorkspaceTab) => void;
};

const tabs = [
  {
    id: "prompt",
    label: "✨ Prompt Builder",
  },
  {
    id: "image",
    label: "🖼 Image Studio",
  },
  {
    id: "video",
    label: "🎥 Video Studio",
  },
  {
    id: "library",
    label: "📚 My Library",
  },
] as const;

export default function WorkspaceTabs({
  activeTab,
  onChange,
}: Props) {
  return (
    <div className="mb-8 rounded-2xl border border-slate-700 bg-slate-900/70 p-2 backdrop-blur">

      <div className="grid grid-cols-2 gap-2 md:grid-cols-4">

        {tabs.map((tab) => {

          const active = activeTab === tab.id;

          return (

            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={`rounded-xl px-5 py-3 text-sm font-semibold transition-all duration-300

                ${
                  active
                    ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg"
                    : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                }`}
            >
              {tab.label}
            </button>

          );
        })}

      </div>

    </div>
  );
}