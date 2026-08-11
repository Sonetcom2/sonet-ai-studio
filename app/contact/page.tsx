export default function ContactPage() {
  return (
    <main className="min-h-screen bg-slate-950 px-6 py-16 text-white">
      <div className="mx-auto max-w-4xl">

        <div className="mb-10 text-center">
          <h1 className="text-4xl font-bold">
            Contact SONET AI STUDIO
          </h1>

          <p className="mt-4 text-slate-400">
            Have a question, suggestion, or need assistance?
            We&apos;re here to help.
          </p>
        </div>

        <div className="rounded-3xl border border-slate-700 bg-slate-900 p-8 shadow-2xl">

          <div className="grid gap-6 md:grid-cols-2">

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Name
              </label>

              <input
                type="text"
                placeholder="Your name"
                className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Email
              </label>

              <input
                type="email"
                placeholder="your@email.com"
                className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none focus:border-cyan-500"
              />
            </div>

          </div>

          <div className="mt-6">
            <label className="mb-2 block text-sm font-medium text-slate-300">
              Subject
            </label>

            <input
              type="text"
              placeholder="How can we help?"
              className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none focus:border-cyan-500"
            />
          </div>

          <div className="mt-6">
            <label className="mb-2 block text-sm font-medium text-slate-300">
              Message
            </label>

            <textarea
              rows={6}
              placeholder="Write your message..."
              className="w-full resize-none rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none focus:border-cyan-500"
            />
          </div>

          <button
            type="button"
            className="mt-6 rounded-xl bg-cyan-600 px-8 py-3 font-semibold text-white transition hover:bg-cyan-700"
          >
            Send Message
          </button>

        </div>

      </div>
    </main>
  );
}