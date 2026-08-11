"use client";

import Link from "next/link";

type Props = {
  totalUsers: number;
  totalImages: number;
  totalRevenue: number;
  creditsUsed: number;
};

const stats = (
  totalUsers: number,
  totalImages: number,
  totalRevenue: number,
  creditsUsed: number
) => [
  {
    title: "Users",
    value: totalUsers.toLocaleString(),
    icon: "👥",
    href: "/admin/users",
    color: "from-blue-500 to-cyan-500",
    badge: "+ Today",
  },
  {
    title: "Images",
    value: totalImages.toLocaleString(),
    icon: "🖼",
    href: "/admin/images",
    color: "from-purple-500 to-pink-500",
    badge: "Live",
  },
  {
    title: "Revenue",
    value: `$${totalRevenue.toLocaleString()}`,
    icon: "💰",
    href: "/admin/payments",
    color: "from-emerald-500 to-green-500",
    badge: "Updated",
  },
  {
  title: "Subscriptions",
  value: creditsUsed.toLocaleString(),
  icon: "💎",
  href: "/admin/subscriptions",
  color: "from-orange-500 to-yellow-500",
  badge: "Plans",
},
];

export default function AdminStats({
  totalUsers,
  totalImages,
  totalRevenue,
  creditsUsed,
}: Props) {
  return (
    <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">

      {stats(
        totalUsers,
        totalImages,
        totalRevenue,
        creditsUsed
      ).map((item) => (

        <Link
          key={item.title}
          href={item.href}
          className="group relative overflow-hidden rounded-3xl border border-slate-700 bg-slate-900/80 backdrop-blur-xl transition-all duration-300 hover:-translate-y-2 hover:border-cyan-400 hover:shadow-[0_20px_60px_rgba(34,211,238,0.2)]"
        >

          <div
            className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${item.color}`}
          />

          <div className="p-7">

            <div className="flex items-center justify-between">

              <div
                className={`flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${item.color} text-3xl shadow-xl`}
              >
                {item.icon}
              </div>

              <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300">
                {item.badge}
              </span>

            </div>

            <h3 className="mt-7 text-lg font-semibold text-slate-300">
              {item.title}
            </h3>

            <p className="mt-3 text-5xl font-black text-white">
              {item.value}
            </p>

            <div className="mt-8 flex items-center justify-between">

              <span className="text-sm text-slate-400">
                View Details
              </span>

              <span className="text-2xl text-cyan-400 transition-transform duration-300 group-hover:translate-x-2">
                →
              </span>

            </div>

          </div>

        </Link>

      ))}

    </section>
  );
}