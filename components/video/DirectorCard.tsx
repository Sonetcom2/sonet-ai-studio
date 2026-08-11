"use client";

type DirectorCardProps = {
  icon: string;
  title: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
};

export default function DirectorCard({
  icon,
  title,
  description,
  checked,
  onChange,
}: DirectorCardProps) {
  return (
    <label
      className={`cursor-pointer rounded-2xl border p-5 transition duration-300
      ${
        checked
          ? "border-cyan-500 bg-cyan-500/10 shadow-lg shadow-cyan-500/10"
          : "border-slate-700 bg-slate-900 hover:border-cyan-400"
      }`}
    >
      <div className="flex items-start justify-between">

        <div>

          <h4 className="text-lg font-bold">
            {icon} {title}
          </h4>

          <p className="mt-2 text-sm text-slate-400">
            {description}
          </p>

        </div>

        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="mt-1 h-5 w-5 accent-cyan-500"
        />

      </div>
    </label>
  );
}