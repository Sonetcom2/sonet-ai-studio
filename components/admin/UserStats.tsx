type Props = {
  totalUsers: number;
  activeUsers: number;
  suspendedUsers: number;
  premiumUsers: number;
};

const cards = (
  totalUsers: number,
  activeUsers: number,
  suspendedUsers: number,
  premiumUsers: number
) => [
  {
    title: "Total Users",
    value: totalUsers,
    icon: "👥",
    color: "from-blue-500 to-cyan-500",
  },
  {
    title: "Active Users",
    value: activeUsers,
    icon: "🟢",
    color: "from-green-500 to-emerald-500",
  },
  {
    title: "Suspended",
    value: suspendedUsers,
    icon: "🚫",
    color: "from-red-500 to-rose-500",
  },
  {
    title: "Premium",
    value: premiumUsers,
    icon: "⭐",
    color: "from-purple-500 to-pink-500",
  },
];

export default function UserStats({
  totalUsers,
  activeUsers,
  suspendedUsers,
  premiumUsers,
}: Props) {
  return (
    <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">

      {cards(
        totalUsers,
        activeUsers,
        suspendedUsers,
        premiumUsers
      ).map((card) => (

        <div
          key={card.title}
          className="overflow-hidden rounded-3xl border border-slate-700 bg-slate-900"
        >

          <div
            className={`h-1 bg-gradient-to-r ${card.color}`}
          />

          <div className="p-6">

            <div
              className={`mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${card.color} text-3xl`}
            >
              {card.icon}
            </div>

            <p className="text-slate-400">
              {card.title}
            </p>

            <h2 className="mt-2 text-4xl font-black text-white">
              {card.value.toLocaleString()}
            </h2>

          </div>

        </div>

      ))}

    </section>
  );
}