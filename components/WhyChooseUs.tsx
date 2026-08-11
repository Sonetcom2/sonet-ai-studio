export default function WhyChooseUs() {
  const reasons = [
    {
      title: "⚡ Lightning Fast",
      description:
        "Generate AI content in seconds with a highly optimized platform.",
    },
    {
      title: "🛡 Secure & Reliable",
      description:
        "Built with performance, privacy, and reliability at its core.",
    },
    {
      title: "🌍 Accessible Anywhere",
      description:
        "Use SONET AI STUDIO on desktop, tablet, or mobile anytime.",
    },
    {
      title: "🚀 Constant Innovation",
      description:
        "We continuously improve with new AI models and creative tools.",
    },
  ];

  return (
    <section className="py-28 px-6 bg-gradient-to-b from-black to-gray-950 text-white">
      <div className="max-w-7xl mx-auto">

        <h2 className="text-5xl font-bold text-center">
          Why Choose SONET AI STUDIO?
        </h2>

        <p className="text-gray-400 text-center mt-5 max-w-3xl mx-auto">
          Built for creators, businesses, students, and professionals who want
          powerful AI tools in one modern platform.
        </p>

        <div className="grid md:grid-cols-2 gap-8 mt-16">
          {reasons.map((reason) => (
            <div
              key={reason.title}
              className="bg-gray-900 rounded-3xl p-8 border border-gray-800 hover:border-blue-500 hover:-translate-y-2 transition-all duration-300 shadow-xl"
            >
              <h3 className="text-2xl font-bold text-blue-400">
                {reason.title}
              </h3>

              <p className="mt-4 text-gray-400 leading-7">
                {reason.description}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}