import Link from "next/link";

type ProfileCardProps = {
  fullName: string;
  email: string;
  createdAt: string;
  storageUsed: string;
  credits: number;
  plan: string;
};

export default function ProfileCard({
  fullName,
  email,
  createdAt,
  storageUsed,
  credits,
  plan,
}: ProfileCardProps) {
  const formattedPlan = plan?.toUpperCase() || "FREE";

  const creditPercentage = Math.min(
    (credits / 100) * 100,
    100
  );

  return (
    <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900/90 via-blue-950/60 to-slate-950/90 p-8 shadow-2xl backdrop-blur-xl">

      {/* ============================
          Profile Header
      ============================ */}

      <div className="flex flex-col items-center text-center">

        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 text-4xl font-black uppercase shadow-[0_0_35px_rgba(34,211,238,0.25)]">
          {(fullName?.charAt(0) || "U").toUpperCase()}
        </div>

        <h2 className="mt-5 text-3xl font-bold text-white">
          {fullName}
        </h2>

        <p className="mt-2 max-w-full truncate text-sm text-cyan-300">
          {email}
        </p>

      </div>

      {/* ============================
          Credits
      ============================ */}

      <div className="mt-8 rounded-2xl border border-cyan-400/20 bg-cyan-400/5 p-5">

        <div className="flex items-center justify-between">

          <div>
            <p className="text-sm font-medium text-slate-400">
              Available Credits
            </p>

            <p className="mt-1 text-4xl font-black text-white">
              {credits.toLocaleString()}
            </p>
          </div>

          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 text-2xl shadow-lg">
            💎
          </div>

        </div>

        {/* Credit progress */}

        <div className="mt-5">

          <div className="mb-2 flex justify-between text-xs">

            <span className="text-slate-500">
              Credit balance
            </span>

            <span className="font-semibold text-cyan-300">
              {credits} credits
            </span>

          </div>

          <div className="h-2 overflow-hidden rounded-full bg-white/10">

            <div
              className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 transition-all duration-500"
              style={{
                width: `${creditPercentage}%`,
              }}
            />

          </div>

        </div>

        {/* Buy credits */}

        <Link
          href="/pricing"
          className="mt-5 block rounded-xl bg-gradient-to-r from-yellow-500 to-orange-500 py-3 text-center font-bold text-white transition-all duration-300 hover:scale-[1.02] hover:shadow-lg"
        >
          💎 Buy More Credits
        </Link>

      </div>

      {/* ============================
          Account Information
      ============================ */}

      <div className="mt-8 space-y-5">

        {/* Membership */}

        <div className="flex items-center justify-between">

          <span className="text-sm text-slate-400">
            Membership
          </span>

          <span className="rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-300">
            {formattedPlan}
          </span>

        </div>

        {/* Status */}

        <div className="flex items-center justify-between">

          <span className="text-sm text-slate-400">
            Account Status
          </span>

          <span className="flex items-center gap-2 text-sm font-semibold text-emerald-400">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            Active
          </span>

        </div>

        {/* Joined */}

        <div className="flex items-center justify-between">

          <span className="text-sm text-slate-400">
            Joined
          </span>

          <span className="text-sm text-white">
            {createdAt
              ? new Date(createdAt).toLocaleDateString()
              : "—"}
          </span>

        </div>

      </div>

      {/* ============================
          Storage
      ============================ */}

      <div className="mt-8">

        <div className="mb-2 flex items-center justify-between text-sm">

          <span className="text-slate-400">
            Storage Used
          </span>

          <span className="font-semibold text-white">
            {storageUsed} MB
          </span>

        </div>

        <div className="h-3 w-full overflow-hidden rounded-full bg-white/10">

          <div
            className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 transition-all duration-500"
            style={{
              width: `${Math.min(
                Number(storageUsed) * 10,
                100
              )}%`,
            }}
          />

        </div>

      </div>

      {/* ============================
          Account Actions
      ============================ */}

      <div className="mt-8 grid grid-cols-2 gap-4">

        <Link
          href="/profile"
          className="rounded-xl border border-white/10 bg-white/5 py-3 text-center font-semibold text-white transition-all duration-300 hover:border-cyan-400/40 hover:bg-cyan-400/10"
        >
          ⚙️ Profile
        </Link>

        <Link
          href="/pricing"
          className="rounded-xl border border-yellow-400/20 bg-yellow-500/10 py-3 text-center font-semibold text-yellow-300 transition-all duration-300 hover:bg-yellow-500/20"
        >
          💳 Pricing
        </Link>

      </div>

    </div>
  );
}