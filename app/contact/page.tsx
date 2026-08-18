"use client";

import { FormEvent, useState } from "react";
import Toast from "@/components/Toast";

export default function ContactPage() {
  const [loading, setLoading] = useState(false);

  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error" | "info";
  } | null>(null);

  function showToast(
    message: string,
    type: "success" | "error" | "info"
  ) {
    setToast({ message, type });

    window.setTimeout(() => {
      setToast(null);
    }, 4000);
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (loading) return;

    const form = event.currentTarget;
    const formData = new FormData(form);

    const name = String(
      formData.get("name") || ""
    ).trim();

    const email = String(
      formData.get("email") || ""
    ).trim();

    const subject = String(
      formData.get("subject") || ""
    ).trim();

    const message = String(
      formData.get("message") || ""
    ).trim();

    if (!name || !email || !subject || !message) {
      showToast(
        "Please fill in all fields.",
        "error"
      );
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "/api/contact",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name,
            email,
            subject,
            message,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.error ||
            "Unable to send your message."
        );
      }

      form.reset();

      showToast(
        "Message sent successfully. We'll get back to you soon.",
        "success"
      );
    } catch (error) {
      console.error(
        "Contact form error:",
        error
      );

      showToast(
        error instanceof Error
          ? error.message
          : "Unable to send your message right now.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-16 text-white">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
        />
      )}

      <div className="mx-auto max-w-4xl">
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-bold">
            Contact SONET AI STUDIO
          </h1>

          <p className="mt-4 text-slate-400">
            Have a question, suggestion, or need
            assistance? We&apos;re here to help.
          </p>
        </div>

        <div className="rounded-3xl border border-slate-700 bg-slate-900 p-8 shadow-2xl">
          <form
            onSubmit={handleSubmit}
            className="space-y-6"
          >
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label
                  htmlFor="name"
                  className="mb-2 block text-sm font-medium text-slate-300"
                >
                  Name
                </label>

                <input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Your name"
                  maxLength={100}
                  required
                  className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-medium text-slate-300"
                >
                  Email
                </label>

                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="your@email.com"
                  required
                  className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="subject"
                className="mb-2 block text-sm font-medium text-slate-300"
              >
                Subject
              </label>

              <input
                id="subject"
                name="subject"
                type="text"
                placeholder="How can we help?"
                maxLength={200}
                required
                className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label
                htmlFor="message"
                className="mb-2 block text-sm font-medium text-slate-300"
              >
                Message
              </label>

              <textarea
                id="message"
                name="message"
                rows={6}
                placeholder="Write your message..."
                maxLength={5000}
                required
                className="w-full resize-none rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none focus:border-cyan-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-cyan-600 px-8 py-3 font-semibold text-white transition hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading
                ? "Sending..."
                : "Send Message"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}