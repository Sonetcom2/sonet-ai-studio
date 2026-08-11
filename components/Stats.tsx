export default function Stats() {
  const stats = [
    {
      number: "50K+",
      label: "AI Images Generated",
    },
    {
      number: "10K+",
      label: "AI Videos Created",
    },
    {
      number: "100+",
      label: "Countries Reached",
    },
    {
      number: "99.9%",
      label: "Platform Uptime",
    },
  ];

  return (
    <section className="py-28 px-6 bg-black text-white">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-bold text-center">
          Trusted by Creators Worldwide
        </h2>

        <p className="mt-4 text-center text-gray-400 max-w-2xl mx-auto">
          Thousands of creators and businesses rely on SONET AI STUDIO to
          accelerate their creativity with powerful AI tools.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-14">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="bg-gray-900 rounded-2xl p-8 shadow-lg hover:-translate-y-2 hover:shadow-2xl transition-all duration-300 text-center"
            >
              <h3 className="text-4xl font-extrabold text-blue-400">
                {stat.number}
              </h3>

              <p className="mt-3 text-gray-400">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}