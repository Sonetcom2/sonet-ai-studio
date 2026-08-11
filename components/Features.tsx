import Link from "next/link";

export default function Features() {
  const features = [
    {
      icon: "🎨",
      title: "AI Image Generator",
      description:
        "Create stunning AI artwork, posters, portraits and product designs in seconds.",
      color: "from-blue-500 to-cyan-500",
      link: "/ai-image",
    },
    {
      icon: "🎬",
      title: "AI Video Generator",
      description:
        "Transform simple ideas into cinematic AI-powered videos effortlessly.",
      color: "from-purple-500 to-pink-500",
      link: "/ai-video",
    },
    {
      icon: "📚",
      title: "Prompt Library",
      description:
        "Discover hundreds of premium prompts for ChatGPT, Midjourney, Claude and more.",
      color: "from-green-500 to-emerald-500",
      link: "/prompt-library",
    },
  ];

  return (
    <section className="py-28 px-6 bg-gradient-to-b from-gray-950 to-black text-white">
      <div className="max-w-7xl mx-auto">

        <h2 className="text-5xl font-bold text-center">
          Explore Our AI Tools
        </h2>

        <p className="text-gray-400 text-center mt-4 max-w-3xl mx-auto">
          Everything you need to create smarter, faster, and more professionally
          with Artificial Intelligence.
        </p>

        <div className="grid md:grid-cols-3 gap-10 mt-16">
          {features.map((feature) => (
            <Link
              key={feature.title}
              href={feature.link}
              className="group"
            >
              <div className="bg-gray-900 border border-gray-800 rounded-3xl p-8 hover:border-blue-500 hover:-translate-y-3 transition-all duration-300 shadow-xl">

                <div
                  className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${feature.color} flex items-center justify-center text-3xl shadow-lg`}
                >
                  {feature.icon}
                </div>

                <h3 className="mt-8 text-2xl font-bold">
                  {feature.title}
                </h3>

                <p className="mt-4 text-gray-400 leading-7">
                  {feature.description}
                </p>

                <div className="mt-8 text-blue-400 font-semibold group-hover:translate-x-2 transition">
                  Learn More →
                </div>

              </div>
            </Link>
          ))}
        </div>

      </div>
    </section>
  );
}