"use client";

import { useState, useEffect } from "react";

type User = {
  id: string;
  fullName: string;
  email: string;
  role: string;
  status: string;
  plan: string;
  credits: number;
};

type Props = {
  user: User | null;
  open: boolean;
  onClose: () => void;
  onSave: (user: User) => Promise<void>;
};

export default function EditUserModal({
  user,
  open,
  onClose,
  onSave,
}: Props) {
  const [form, setForm] = useState<User | null>(null);

  useEffect(() => {
    setForm(user);
  }, [user]);

  if (!open || !form) return null;

  function update<K extends keyof User>(key: K, value: User[K]) {
    setForm((prev) =>
      prev ? { ...prev, [key]: value } : prev
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">

      <div className="w-full max-w-2xl rounded-3xl border border-slate-700 bg-slate-900 p-8">

        <div className="mb-8 flex items-center justify-between">

          <h2 className="text-3xl font-bold text-white">
            ✏️ Edit User
          </h2>

          <button
            onClick={onClose}
            className="rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700"
          >
            ✕
          </button>

        </div>

        <div className="space-y-5">

          <input
            value={form.fullName}
            onChange={(e) =>
              update("fullName", e.target.value)
            }
            placeholder="Full Name"
            className="w-full rounded-xl bg-slate-800 p-3 text-white"
          />

          <input
            value={form.email}
            disabled
            className="w-full rounded-xl bg-slate-700 p-3 text-slate-400"
          />

          <select
            value={form.role}
            onChange={(e) =>
              update("role", e.target.value)
            }
            className="w-full rounded-xl bg-slate-800 p-3 text-white"
          >
            <option>USER</option>
            <option>ADMIN</option>
          </select>

          <select
            value={form.plan}
            onChange={(e) =>
              update("plan", e.target.value)
            }
            className="w-full rounded-xl bg-slate-800 p-3 text-white"
          >
            <option>FREE</option>
            <option>PRO</option>
            <option>PREMIUM</option>
          </select>

          <select
            value={form.status}
            onChange={(e) =>
              update("status", e.target.value)
            }
            className="w-full rounded-xl bg-slate-800 p-3 text-white"
          >
            <option>ACTIVE</option>
            <option>SUSPENDED</option>
          </select>

          <input
            type="number"
            value={form.credits}
            onChange={(e) =>
              update("credits", Number(e.target.value))
            }
            className="w-full rounded-xl bg-slate-800 p-3 text-white"
          />

        </div>

        <div className="mt-8 flex justify-end gap-4">

          <button
            onClick={onClose}
            className="rounded-xl bg-slate-700 px-6 py-3 text-white"
          >
            Cancel
          </button>

          <button
            onClick={() => onSave(form)}
            className="rounded-xl bg-cyan-600 px-6 py-3 text-white hover:bg-cyan-700"
          >
            Save Changes
          </button>

        </div>

      </div>

    </div>
  );
}