export default function FAQ() {
  const faqs = [
    {
      question: "What is SONET AI STUDIO?",
      answer:
        "SONET AI STUDIO is an all-in-one AI platform for creating images, videos, prompts, and other creative content.",
    },
    {
      question: "Do I need AI experience?",
      answer:
        "No. SONET AI STUDIO is designed for beginners, creators, professionals, and businesses alike.",
    },
    {
      question: "Can I use it on my phone?",
      answer:
        "Yes. The platform is fully responsive and works across desktop, tablet, and mobile devices.",
    },
    {
      question: "Will more AI tools be added?",
      answer:
        "Absolutely. We continuously expand SONET AI STUDIO with new AI-powered features and services.",
    },
  ];

  return (
    <section className="py-28 px-6 bg-black text-white">
      <div className="max-w-5xl mx-auto">

        <h2 className="text-5xl font-bold text-center">
          Frequently Asked Questions
        </h2>

        <p className="text-center text-gray-400 mt-5">
          Everything you need to know before getting started.
        </p>

        <div className="mt-14 space-y-6">
          {faqs.map((faq) => (
            <div
              key={faq.question}
              className="bg-gray-900 rounded-2xl p-8 border border-gray-800 hover:border-blue-500 transition duration-300"
            >
              <h3 className="text-xl font-bold text-blue-400">
                {faq.question}
              </h3>

              <p className="mt-4 text-gray-400 leading-7">
                {faq.answer}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}