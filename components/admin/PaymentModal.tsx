"use client";

type Payment = {
  id: string;
  user_id: string | null;
  amount: number | string;
  currency: string | null;
  provider: string | null;
  reference: string | null;
  status: string | null;
  created_at: string;
};

type Props = {
  payment: Payment | null;
  open: boolean;
  onClose: () => void;
};

export default function PaymentModal({
  payment,
  open,
  onClose,
}: Props) {
  if (!open || !payment) return null;

  const status = payment.status?.toUpperCase() || "PENDING";

  const statusClass =
    status === "SUCCESS"
      ? "bg-green-500/20 text-green-300"
      : status === "FAILED"
        ? "bg-red-500/20 text-red-300"
        : "bg-yellow-500/20 text-yellow-300";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">

      <div className="w-full max-w-2xl rounded-3xl border border-slate-700 bg-slate-900 p-8 shadow-2xl">

        {/* Header */}

        <div className="mb-8 flex items-center justify-between">

          <div>
            <h2 className="text-3xl font-bold text-white">
              💳 Payment Details
            </h2>

            <p className="mt-1 text-sm text-slate-400">
              Transaction information
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-red-600 px-4 py-2 font-semibold text-white transition hover:bg-red-700"
          >
            ✕
          </button>

        </div>

        {/* Details */}

        <div className="space-y-5">

          <Info
            label="Transaction ID"
            value={payment.id}
          />

          <Info
            label="User ID"
            value={payment.user_id || "—"}
          />

          <Info
            label="Amount"
            value={`${payment.currency || "NGN"} ${Number(
              payment.amount || 0
            ).toLocaleString()}`}
          />

          <Info
            label="Provider"
            value={payment.provider || "—"}
          />

          <Info
            label="Reference"
            value={payment.reference || "—"}
          />

          <div className="flex items-center justify-between border-b border-slate-700 pb-4">

            <span className="font-medium text-slate-400">
              Status
            </span>

            <span
              className={`rounded-full px-4 py-1 text-sm font-semibold ${statusClass}`}
            >
              {status}
            </span>

          </div>

          <Info
            label="Created"
            value={
              payment.created_at
                ? new Date(
                    payment.created_at
                  ).toLocaleString()
                : "—"
            }
          />

        </div>

        {/* Footer */}

        <div className="mt-8 flex justify-end">

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-slate-700 px-6 py-3 font-semibold text-white transition hover:bg-slate-600"
          >
            Close
          </button>

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
    <div className="flex flex-col gap-2 border-b border-slate-700 pb-4 sm:flex-row sm:items-center sm:justify-between">

      <span className="font-medium text-slate-400">
        {label}
      </span>

      <span className="max-w-full break-all text-right font-semibold text-white">
        {value}
      </span>

    </div>
  );
}