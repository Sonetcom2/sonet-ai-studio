"use client";

type User = {
  id: string;
  fullName: string;
  email: string;
  role: string;
  status: string;
  plan: string;
  credits: number;
  lastLogin: string | null;
  createdAt: string;
};

type Props = {
  user: User | null;
  open: boolean;
  onClose: () => void;
  onConfirm: (userId: string) => void;
  loading?: boolean;
};

export default function SuspendUserModal({
  user,
  open,
  onClose,
  onConfirm,
  loading = false,
}: Props) {
  if (!open || !user) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">

      <div className="w-full max-w-lg rounded-3xl border border-slate-700 bg-slate-900 p-8 shadow-2xl">

        {/* Header */}

        <div className="flex items-center justify-between">

          <h2 className="text-2xl font-bold text-white">
            🚫 Suspend User
          </h2>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-lg bg-slate-700 px-3 py-2 text-white transition hover:bg-slate-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            ✕
          </button>

        </div>

        {/* Message */}

        <div className="mt-6 rounded-2xl border border-yellow-500/20 bg-yellow-500/10 p-5">

          <p className="text-slate-300">
            Are you sure you want to suspend this user?
          </p>

          <div className="mt-4">

            <p className="font-semibold text-white">
              {user.fullName || "Unnamed User"}
            </p>

            <p className="mt-1 text-sm text-slate-400">
              {user.email}
            </p>

          </div>

        </div>

        <p className="mt-5 text-sm text-slate-400">
          A suspended user will have their account status changed to
          <span className="font-semibold text-yellow-400">
            {" "}SUSPENDED
          </span>.
        </p>

        {/* Actions */}

        <div className="mt-8 flex justify-end gap-3">

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-xl border border-slate-600 bg-slate-800 px-5 py-3 font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={() => onConfirm(user.id)}
            disabled={loading}
            className="rounded-xl bg-yellow-600 px-5 py-3 font-semibold text-white transition hover:bg-yellow-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Suspending..." : "Confirm Suspension"}
          </button>

        </div>

      </div>

    </div>
  );
}