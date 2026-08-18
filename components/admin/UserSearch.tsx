"use client";

type Props = {
  value: string;
  onChange: (value: string) => void;
};

export default function UserSearch({
  value,
  onChange,
}: Props) {
  return (
    <div className="rounded-2xl border border-slate-700 bg-slate-900 p-6">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search users by name or email..."
        className="w-full rounded-xl border border-slate-600 bg-slate-800 px-5 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-500"
      />
    </div>
  );
}