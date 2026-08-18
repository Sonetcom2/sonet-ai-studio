"use client";

type Filter =
  | "ALL"
  | "FREE"
  | "PRO"
  | "PREMIUM"
  | "ACTIVE"
  | "SUSPENDED";

type Props = {
  activeFilter: Filter;
  onFilterChange: (filter: Filter) => void;
};

const filters: {
  label: string;
  value: Filter;
}[] = [
  {
    label: "All",
    value: "ALL",
  },
  {
    label: "Free",
    value: "FREE",
  },
  {
    label: "Pro",
    value: "PRO",
  },
  {
    label: "Premium",
    value: "PREMIUM",
  },
  {
    label: "Active",
    value: "ACTIVE",
  },
  {
    label: "Suspended",
    value: "SUSPENDED",
  },
];

export default function UserFilters({
  activeFilter,
  onFilterChange,
}: Props) {
  return (
    <div className="flex flex-wrap gap-3">
      {filters.map((item) => {
        const active =
          activeFilter === item.value;

        return (
          <button
            key={item.value}
            type="button"
            onClick={() =>
              onFilterChange(item.value)
            }
            className={`rounded-xl px-5 py-2 font-medium transition ${
              active
                ? "bg-cyan-600 text-white"
                : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            }`}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}