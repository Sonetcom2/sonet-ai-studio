type StatsCardsProps = {
  totalImages: number;
  imagesToday: number;
  imagesThisMonth: number;
  totalVideos: number;
  credits: number;
};

const cards = [
  {
    key: "images",
    icon: "🖼",
    title: "Total Images",
    color: "from-cyan-500 to-blue-600",
    badge: "Gallery",
  },
  {
    key: "videos",
    icon: "🎥",
    title: "Total Videos",
    color: "from-orange-500 to-red-600",
    badge: "Studio",
  },
  {
    key: "credits",
    icon: "💎",
    title: "Available Credits",
    color: "from-yellow-500 to-amber-600",
    badge: "Balance",
  },
  {
    key: "month",
    icon: "📈",
    title: "This Month",
    color: "from-emerald-500 to-green-600",
    badge: "Monthly",
  },
];

export default function StatsCards({
  totalImages,
  totalVideos,
  credits,
  imagesThisMonth,
}: StatsCardsProps) {
  const values = {
    images: totalImages,
    videos: totalVideos,
    credits: credits,
    month: imagesThisMonth,
  };

  const subtitles = {
    images: "Images stored in your library",
    videos: "Videos generated with SONET",
    credits: "Credits available for AI generation",
    month: "Images generated this month",
  };

  return (
    <section className="mb-12 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">

      {cards.map((card) => (
        <div
          key={card.key}
          className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl transition-all duration-300 hover:-translate-y-2 hover:border-cyan-400/40 hover:shadow-[0_0_40px_rgba(34,211,238,0.18)]"
        >

          {/* Top gradient */}
          <div
            className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${card.color}`}
          />

          {/* Icon + Badge */}
          <div className="flex items-center justify-between">

            <div
              className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${card.color} text-3xl shadow-lg transition-transform duration-300 group-hover:scale-110`}
            >
              {card.icon}
            </div>

            <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-semibold text-slate-200">
              {card.badge}
            </span>

          </div>

          {/* Title */}
          <h3 className="mt-6 text-sm font-medium uppercase tracking-wider text-slate-400">
            {card.title}
          </h3>

          {/* Value */}
          <p className="mt-3 text-5xl font-black text-white">
            {values[card.key as keyof typeof values].toLocaleString()}
          </p>

          {/* Subtitle */}
          <p className="mt-4 text-sm text-slate-400">
            {subtitles[card.key as keyof typeof subtitles]}
          </p>

        </div>
      ))}

    </section>
  );
}