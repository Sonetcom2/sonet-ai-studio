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

export default function DeleteUserModal({
  user,
  open,
  onClose,
  onConfirm,
  loading = false,
}: Props) {
  if (!open || !user) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">

      <div className="w-full max-w-lg rounded-3xl border border-red-500/30 bg-slate-900 p-8 shadow-2xl">

        {/* Header */}

        <div className="flex items-center justify-between">

          <h2 className="text-2xl font-bold text-white">
            🗑 Delete User
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

        {/* Warning */}

        <div className="mt-6 rounded-2xl border border-red-500/20 bg-red-500/10 p-5">

          <p className="font-semibold text-red-300">
            ⚠️ This action cannot be undone.
          </p>

          <p className="mt-3 text-slate-300">
            Are you sure you want to permanently delete this user?
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
          The user will be permanently removed from the system.
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
            className="rounded-xl bg-red-600 px-5 py-3 font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Deleting..." : "Delete User"}
          </button>

        </div>

      </div>

    </div>
  );
}