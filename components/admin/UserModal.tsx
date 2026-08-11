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
};

export default function UserModal({
  user,
  open,
  onClose,
}: Props) {
  if (!open || !user) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">

      <div className="w-full max-w-2xl rounded-3xl border border-slate-700 bg-slate-900 p-8">

        <div className="mb-8 flex items-center justify-between">

          <h2 className="text-3xl font-bold text-white">
            👤 User Profile
          </h2>

          <button
            onClick={onClose}
            className="rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700"
          >
            ✕
          </button>

        </div>

        <div className="grid gap-5">

          <Info label="Full Name" value={user.fullName} />
          <Info label="Email" value={user.email} />
          <Info label="Role" value={user.role} />
          <Info label="Status" value={user.status} />
          <Info label="Plan" value={user.plan} />
          <Info label="Credits" value={user.credits.toString()} />
          <Info
            label="Joined"
            value={
              user.createdAt
                ? new Date(user.createdAt).toLocaleDateString()
                : "-"
            }
          />
          <Info
            label="Last Login"
            value={
              user.lastLogin
                ? new Date(user.lastLogin).toLocaleDateString()
                : "Never"
            }
          />

        </div>

      </div>

    </div>
  );
}

function Info({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex justify-between border-b border-slate-700 pb-3">

      <span className="font-medium text-slate-400">
        {label}
      </span>

      <span className="font-semibold text-white">
        {value}
      </span>

    </div>
  );
}