export default function Testimonials() {
  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Content Creator",
      message:
        "SONET AI STUDIO has transformed the way I create content. It's fast and incredibly easy to use.",
    },
    {
      name: "David Wilson",
      role: "Digital Marketer",
      message:
        "The AI Image Generator saves me hours every week. Highly recommended!",
    },
    {
      name: "Grace Adams",
      role: "Business Owner",
      message:
        "Beautiful interface, powerful AI tools, and outstanding results.",
    },
  ];

  return (
    <section className="py-20 bg-gray-950 text-white px-6">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl font-bold text-center">
          What Our Users Say
        </h2>

        <div className="grid md:grid-cols-3 gap-8 mt-14">
          {testimonials.map((user) => (
            <div
              key={user.name}
              className="bg-gray-900 rounded-2xl p-8 shadow-lg hover:-translate-y-2 hover:shadow-2xl transition-all duration-300"
            >
              <p className="text-gray-300 italic">
                "{user.message}"
              </p>

              <h3 className="mt-6 font-bold text-xl">
                {user.name}
              </h3>

              <p className="text-blue-400">
                {user.role}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}