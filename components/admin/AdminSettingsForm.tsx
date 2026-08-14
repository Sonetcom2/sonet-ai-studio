"use client";

import { useEffect, useState } from "react";

type Settings = {
  site_name: string;
  maintenance_mode: boolean;
  free_credits: number;
  pro_price: number;
  pro_credits: number;
  premium_price: number;
  image_generation_cost: number;
  video_generation_cost: number;
};

const defaultSettings: Settings = {
  site_name: "",
  maintenance_mode: false,
  free_credits: 100,
  pro_price: 5000,
  pro_credits: 1000,
  premium_price: 25000,
  image_generation_cost: 10,
  video_generation_cost: 10,
};

export default function AdminSettingsForm() {
  const [settings, setSettings] =
    useState<Settings>(defaultSettings);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadSettings() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          "/api/admin/settings",
          {
            method: "GET",
            cache: "no-store",
          }
        );

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

    loadSettings();
  }, []);

  function updateField<K extends keyof Settings>(
    field: K,
    value: Settings[K]
  ) {
    setSettings((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleSave() {
    try {
      setSaving(true);
      setMessage("");
      setError("");

      const response = await fetch(
        "/api/admin/settings",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(settings),
        }
      );

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
      <div className="rounded-3xl border border-slate-700 bg-slate-900 p-10 text-center">
        <p className="text-slate-400">
          Loading settings...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {message && (
        <div className="rounded-xl border border-emerald-700 bg-emerald-950/40 px-5 py-4 text-emerald-300">
          {message}
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-700 bg-red-950/40 px-5 py-4 text-red-300">
          {error}
        </div>
      )}

      <div className="rounded-3xl border border-slate-700 bg-slate-900 p-8 shadow-2xl">
        <h2 className="mb-6 text-2xl font-bold">
          General Settings
        </h2>

        <div className="space-y-6">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">
              Site Name
            </label>

            <input
              type="text"
              value={settings.site_name}
              onChange={(e) =>
                updateField(
                  "site_name",
                  e.target.value
                )
              }
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex items-center justify-between rounded-xl border border-slate-700 bg-slate-950 p-5">
            <div>
              <h3 className="font-semibold">
                Maintenance Mode
              </h3>

              <p className="mt-1 text-sm text-slate-400">
                Temporarily place SONET AI STUDIO into maintenance mode.
              </p>
            </div>

            <input
              type="checkbox"
              checked={settings.maintenance_mode}
              onChange={(e) =>
                updateField(
                  "maintenance_mode",
                  e.target.checked
                )
              }
              className="h-5 w-5"
            />
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-700 bg-slate-900 p-8 shadow-2xl">
        <h2 className="mb-6 text-2xl font-bold">
          Credit Settings
        </h2>

        <div className="grid gap-6 md:grid-cols-3">
          <div>
            <label className="mb-2 block text-sm text-slate-300">
              Free Credits
            </label>

            <input
              type="number"
              min="0"
              value={settings.free_credits}
              onChange={(e) =>
                updateField(
                  "free_credits",
                  Number(e.target.value)
                )
              }
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-slate-300">
              Image Generation Cost
            </label>

            <input
              type="number"
              min="0"
              value={settings.image_generation_cost}
              onChange={(e) =>
                updateField(
                  "image_generation_cost",
                  Number(e.target.value)
                )
              }
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-slate-300">
              Video Generation Cost
            </label>

            <input
              type="number"
              min="0"
              value={settings.video_generation_cost}
              onChange={(e) =>
                updateField(
                  "video_generation_cost",
                  Number(e.target.value)
                )
              }
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white"
            />
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-700 bg-slate-900 p-8 shadow-2xl">
        <h2 className="mb-6 text-2xl font-bold">
          Pro Plan
        </h2>

        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm text-slate-300">
              Pro Price (NGN)
            </label>

            <input
              type="number"
              min="0"
              value={settings.pro_price}
              onChange={(e) =>
                updateField(
                  "pro_price",
                  Number(e.target.value)
                )
              }
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-slate-300">
              Pro Credits
            </label>

            <input
              type="number"
              min="0"
              value={settings.pro_credits}
              onChange={(e) =>
                updateField(
                  "pro_credits",
                  Number(e.target.value)
                )
              }
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white"
            />
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-700 bg-slate-900 p-8 shadow-2xl">
        <h2 className="mb-6 text-2xl font-bold">
          Premium Plan
        </h2>

        <div>
          <label className="mb-2 block text-sm text-slate-300">
            Premium Price (NGN)
          </label>

          <input
            type="number"
            min="0"
            value={settings.premium_price}
            onChange={(e) =>
              updateField(
                "premium_price",
                Number(e.target.value)
              )
            }
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white"
          />
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="rounded-xl bg-blue-600 px-8 py-3 font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Settings"}
        </button>
      </div>
    </div>
  );
}