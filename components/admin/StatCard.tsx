type StatCardProps = {
  title: string;
  value: string | number;
  icon: string;
  color: string;
  subtitle: string;
};

export default function StatCard({
  title,
  value,
  icon,
  color,
  subtitle,
}: StatCardProps) {
  return (
    <div className="group overflow-hidden rounded-3xl border border-slate-800 bg-slate-900 p-6 transition-all duration-300 hover:-translate-y-2 hover:border-cyan-500">

      <div className="flex items-center justify-between">

        <div
          className={`flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${color} text-3xl shadow-xl`}
        >
          {icon}
        </div>

        <div className="text-right">

          <h2 className="text-4xl font-black text-white">
            {value}
          </h2>

          <p className="text-sm text-slate-400">
            {title}
          </p>

        </div>

      </div>

      <div className="mt-6 border-t border-slate-800 pt-4">

        <p className="text-sm text-slate-500">
          {subtitle}
        </p>

      </div>

    </div>
  );
}