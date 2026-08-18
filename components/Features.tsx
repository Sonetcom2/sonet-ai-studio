
import Link from "next/link";

export default function Features() {
  const features = [
    {
      icon: "🤖",
      title: "SONET AI Assistant",
      description:
        "Chat with SONET AI for creative ideas, business assistance, content creation, prompt engineering, and everyday AI help.",
      color: "from-cyan-500 to-blue-500",
      link: "/ai-assistant",
    },
    {
      icon: "🎨",
      title: "AI Image Generator",
      description:
        "Create stunning AI artwork, portraits, product designs, marketing graphics, and professional visuals in seconds.",
      color: "from-blue-500 to-cyan-500",
      link: "/ai-image",
    },
    {
      icon: "🎬",
      title: "AI Video Generator",
      description:
        "Transform your ideas into cinematic AI-powered videos for social media, marketing, storytelling, and business.",
      color: "from-purple-500 to-pink-500",
      link: "/ai-video",
    },
    {
      icon: "✨",
      title: "SONET Prompt Engineer",
      description:
        "Turn simple ideas into detailed, professional AI prompts designed to produce better creative results.",
      color: "from-indigo-500 to-purple-500",
      link: "/prompt-builder",
    },
    {
      icon: "📚",
      title: "Prompt Library",
      description:
        "Explore a growing collection of useful AI prompts for content creation, marketing, images, business, and more.",
      color: "from-green-500 to-emerald-500",
      link: "/prompt-library",
    },
    {
      icon: "💰",
      title: "Affiliate Program",
      description:
        "Share SONET AI STUDIO with others and unlock opportunities to earn through the SONET affiliate program.",
      color: "from-yellow-500 to-orange-500",
      link: "/affiliate",
    },
  ];

  return (
    <section className="py-28 px-6 bg-gradient-to-b from-gray-950 to-black text-white">
      <div className="max-w-7xl mx-auto">

        {/* SECTION HEADER */}
        <div className="text-center">
          <p className="text-cyan-400 font-semibold uppercase tracking-widest text-sm">
            SONET AI STUDIO
          </p>

          <h2 className="mt-3 text-5xl font-bold">
            Everything You Need to Create With AI
          </h2>

          <p className="text-gray-400 text-center mt-5 max-w-3xl mx-auto text-lg leading-8">
            Create, communicate, market, and grow with a powerful collection
            of AI tools designed to make your work faster, easier, and more
            professional.
          </p>
        </div>

        {/* FEATURES GRID */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mt-16">
          {features.map((feature) => (
            <Link
              key={feature.title}
              href={feature.link}
              className="group"
            >
              <div className="h-full bg-gray-900 border border-gray-800 rounded-3xl p-8 hover:border-cyan-500/60 hover:-translate-y-2 transition-all duration-300 shadow-xl">

                {/* ICON */}
                <div
                  className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${feature.color} flex items-center justify-center text-3xl shadow-lg`}
                >
                  {feature.icon}
                </div>

                {/* TITLE */}
                <h3 className="mt-7 text-2xl font-bold">
                  {feature.title}
                </h3>

                {/* DESCRIPTION */}
                <p className="mt-4 text-gray-400 leading-7">
                  {feature.description}
                </p>

                {/* LINK */}
                <div className="mt-7 text-cyan-400 font-semibold group-hover:translate-x-2 transition">
                  Explore Tool →
                </div>

              </div>
            </Link>
          ))}
        </div>

        {/* BOTTOM MESSAGE */}
        <div className="mt-16 text-center">
          <p className="text-gray-500 text-sm">
            One platform. Multiple AI tools. One simple creative experience.
          </p>
        </div>

      </div>
    </section>
  );
}