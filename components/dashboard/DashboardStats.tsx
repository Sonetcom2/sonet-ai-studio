"use client";

import { useEffect, useState } from "react";

type Stats = {
  totalImages: number;
  imagesToday: number;
  totalVideos: number;
  videosToday: number;
  credits: number;
  storageUsed: number;
};

export default function DashboardStats() {
  const [stats, setStats] = useState<Stats>({
    totalImages: 0,
    imagesToday: 0,
    totalVideos: 0,
    videosToday: 0,
    credits: 0,
    storageUsed: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  async function loadStats() {
    try {
      const res = await fetch("/api/dashboard/stats");

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error);
      }

      setStats(data.stats);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  const cards = [
    {
      icon: "🖼",
      title: "Total Images",
      value: stats.totalImages,
      sub: `+${stats.imagesToday} Today`,
      bg: "from-blue-600 to-indigo-700",
    },
    {
      icon: "🎥",
      title: "Videos",
      value: stats.totalVideos,
      sub: `+${stats.videosToday} Today`,
      bg: "from-pink-600 to-purple-700",
    },
    {
      icon: "⚡",
      title: "Credits",
      value: stats.credits.toLocaleString(),
      sub: "Available",
      bg: "from-emerald-600 to-green-700",
    },
    {
      icon: "💾",
      title: "Storage",
      value: `${stats.storageUsed} MB`,
      sub: "Used",
      bg: "from-orange-500 to-red-600",
    },
  ];

  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">

      {cards.map((card) => (

        <div
          key={card.title}
          className={`rounded-3xl bg-gradient-to-br ${card.bg} p-[1px] shadow-xl transition duration-300 hover:-translate-y-2 hover:shadow-2xl`}
        >

          <div className="rounded-3xl bg-slate-900/90 p-6 backdrop-blur-xl">

            <div className="flex items-center justify-between">

              <span className="text-5xl">
                {card.icon}
              </span>

              <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-green-300">
                Live
              </span>

            </div>

            <h3 className="mt-6 text-lg font-semibold text-slate-300">
              {card.title}
            </h3>

            <div className="mt-3 text-5xl font-extrabold text-white">

              {loading ? (
                <div className="h-10 w-24 animate-pulse rounded bg-slate-700" />
              ) : (
                card.value
              )}

            </div>

            <p className="mt-3 text-sm text-slate-400">
              {card.sub}
            </p>

          </div>

        </div>

      ))}

    </div>
  );
}