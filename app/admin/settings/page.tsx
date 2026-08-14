"use client";

import { FormEvent, useEffect, useState } from "react";

type Settings = {
  id: string;
  site_name: string;
  maintenance_mode: boolean;
  free_credits: number;
  pro_price: number;
  pro_credits: number;
  premium_price: number;
  image_generation_cost: number;
  video_generation_cost: number;
  created_at: string;
  updated_at: string;
};

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    try {
      setLoading(true);
      setError("");
      setMessage("");

      const response = await fetch("/api/admin/settings", {
        method: "GET",
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.error || "Unable to load settings."
        );
      }

      setSettings(data.settings);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load settings."
      );
    } finally {
      setLoading(false);
    }
  }

  function updateField(
    field: keyof Settings,
    value: string | number | boolean
  ) {
    setSettings((current) =>
      current
        ? {
            ...current,
            [field]: value,
          }
        : current
    );
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!settings) {
      return;
    }

    try {
      setSaving(true);
      setError("");
      setMessage("");

      const response = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          site_name: settings.site_name,
          maintenance_mode: settings.maintenance_mode,
          free_credits: Number(settings.free_credits),
          pro_price: Number(settings.pro_price),
          pro_credits: Number(settings.pro_credits),
          premium_price: Number(settings.premium_price),
          image_generation_cost: Number(
            settings.image_generation_cost
          ),
          video_generation_cost: Number(
            settings.video_generation_cost
          ),
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.error || "Unable to save settings."
        );
      }

      setSettings(data.settings);
      setMessage("Settings saved successfully.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to save settings."
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 px-6 py-10 text-white">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-3xl border border-slate-700 bg-slate-900 p-10">
            <p className="text-slate-400">
              Loading admin settings...
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (!settings) {
    return (
      <main className="min-h-screen bg-slate-950 px-6 py-10 text-white">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-3xl border border-red-500/30 bg-slate-900 p-10">
            <h1 className="text-2xl font-bold">
              Unable to load settings
            </h1>

            <p className="mt-3 text-red-400">
              {error || "No settings were found."}
            </p>

            <button
              type="button"
              onClick={loadSettings}
              className="mt-6 rounded-xl bg-blue-600 px-5 py-3 font-semibold transition hover:bg-blue-500"
            >
              Try Again
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-white">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold">
            Admin Settings
          </h1>

          <p className="mt-2 text-slate-400">
            Manage SONET AI STUDIO site settings, pricing,
            credits and generation costs.
          </p>
        </div>

        {/* Messages */}
        {message && (
          <div className="mb-6 rounded-xl border border-green-500/30 bg-green-500/10 px-5 py-4 text-green-400">
            {message}
          </div>
        )}

        {error && (
          <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 px-5 py-4 text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid gap-6 lg:grid-cols-2">
            {/* General Settings */}
            <section className="rounded-3xl border border-slate-700 bg-slate-900 p-7 shadow-xl">
              <h2 className="text-2xl font-bold">
                General Settings
              </h2>

              <p className="mt-1 text-sm text-slate-400">
                Basic information and availability of the
                platform.
              </p>

              <div className="mt-6 space-y-5">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">
                    Site Name
                  </label>

                  <input
                    type="text"
                    value={settings.site_name}
                    onChange={(event) =>
                      updateField(
                        "site_name",
                        event.target.value
                      )
                    }
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-blue-500"
                    required
                  />
                </div>

                <div className="flex items-center justify-between rounded-2xl border border-slate-700 bg-slate-950 p-5">
                  <div>
                    <h3 className="font-semibold">
                      Maintenance Mode
                    </h3>

                    <p className="mt-1 text-sm text-slate-400">
                      Temporarily disable normal site access.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      updateField(
                        "maintenance_mode",
                        !settings.maintenance_mode
                      )
                    }
                    className={`relative h-7 w-14 rounded-full transition ${
                      settings.maintenance_mode
                        ? "bg-red-600"
                        : "bg-slate-700"
                    }`}
                    aria-label="Toggle maintenance mode"
                  >
                    <span
                      className={`absolute top-1 h-5 w-5 rounded-full bg-white transition ${
                        settings.maintenance_mode
                          ? "left-8"
                          : "left-1"
                      }`}
                    />
                  </button>
                </div>
              </div>
            </section>

            {/* Free Plan */}
            <section className="rounded-3xl border border-slate-700 bg-slate-900 p-7 shadow-xl">
              <h2 className="text-2xl font-bold">
                Free Plan
              </h2>

              <p className="mt-1 text-sm text-slate-400">
                Default credits assigned to free users.
              </p>

              <div className="mt-6">
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Free Credits
                </label>

                <input
                  type="number"
                  min="0"
                  value={settings.free_credits}
                  onChange={(event) =>
                    updateField(
                      "free_credits",
                      Number(event.target.value)
                    )
                  }
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-blue-500"
                />
              </div>
            </section>

            {/* Pro Plan */}
            <section className="rounded-3xl border border-slate-700 bg-slate-900 p-7 shadow-xl">
              <h2 className="text-2xl font-bold">
                Pro Plan
              </h2>

              <p className="mt-1 text-sm text-slate-400">
                Configure Pro subscription pricing and
                credits.
              </p>

              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">
                    Pro Price (NGN)
                  </label>

                  <input
                    type="number"
                    min="0"
                    value={settings.pro_price}
                    onChange={(event) =>
                      updateField(
                        "pro_price",
                        Number(event.target.value)
                      )
                    }
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">
                    Pro Credits
                  </label>

                  <input
                    type="number"
                    min="0"
                    value={settings.pro_credits}
                    onChange={(event) =>
                      updateField(
                        "pro_credits",
                        Number(event.target.value)
                      )
                    }
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </section>

            {/* Premium Plan */}
            <section className="rounded-3xl border border-slate-700 bg-slate-900 p-7 shadow-xl">
              <h2 className="text-2xl font-bold">
                Premium Plan
              </h2>

              <p className="mt-1 text-sm text-slate-400">
                Configure Premium subscription pricing.
              </p>

              <div className="mt-6">
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Premium Price (NGN)
                </label>

                <input
                  type="number"
                  min="0"
                  value={settings.premium_price}
                  onChange={(event) =>
                    updateField(
                      "premium_price",
                      Number(event.target.value)
                    )
                  }
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-blue-500"
                />
              </div>
            </section>

            {/* Generation Costs */}
            <section className="rounded-3xl border border-slate-700 bg-slate-900 p-7 shadow-xl lg:col-span-2">
              <h2 className="text-2xl font-bold">
                AI Generation Costs
              </h2>

              <p className="mt-1 text-sm text-slate-400">
                Set the number of credits consumed by each
                generation.
              </p>

              <div className="mt-6 grid gap-5 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">
                    Image Generation Cost
                  </label>

                  <input
                    type="number"
                    min="0"
                    value={
                      settings.image_generation_cost
                    }
                    onChange={(event) =>
                      updateField(
                        "image_generation_cost",
                        Number(event.target.value)
                      )
                    }
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-blue-500"
                  />

                  <p className="mt-2 text-xs text-slate-500">
                    Credits charged per generated image.
                  </p>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">
                    Video Generation Cost
                  </label>

                  <input
                    type="number"
                    min="0"
                    value={
                      settings.video_generation_cost
                    }
                    onChange={(event) =>
                      updateField(
                        "video_generation_cost",
                        Number(event.target.value)
                      )
                    }
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-blue-500"
                  />

                  <p className="mt-2 text-xs text-slate-500">
                    Credits charged per generated video.
                  </p>
                </div>
              </div>
            </section>
          </div>

          {/* Save */}
          <div className="mt-8 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-blue-600 px-8 py-3 font-semibold transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving
                ? "Saving Settings..."
                : "Save Settings"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}