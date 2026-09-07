import { supabaseAdmin } from "@/lib/supabase/admin";
import { createCommission } from "@/services/commissionService";

export async function approveManualPayment(paymentId: string) {
  if (!paymentId || typeof paymentId !== "string") {
    throw new Error("Payment ID is required.");
  }

  // First confirm this is a valid pending manual payment.
  const { data: paymentBefore, error: paymentBeforeError } =
    await supabaseAdmin
      .from("payments")
      .select(
        `
        id,
        user_id,
        amount,
        currency,
        provider,
        reference,
        status,
        plan,
        payment_method,
        customer_note,
        created_at
      `
      )
      .eq("id", paymentId)
      .single();

  if (paymentBeforeError || !paymentBefore) {
    throw new Error("Payment not found.");
  }

  if (
    String(paymentBefore.provider ?? "").toUpperCase() !==
    "MANUAL"
  ) {
    throw new Error("This is not a manual payment.");
  }

  if (
    String(paymentBefore.status ?? "").toUpperCase() !==
    "PENDING"
  ) {
    throw new Error("Payment is no longer pending.");
  }

  // The database RPC performs the important atomic operation:
  // - validates the payment
  // - validates the plan
  // - validates the configured price
  // - gets the configured credits
  // - activates the user's plan
  // - grants the configured credits
  // - changes payment status to SUCCESS
  const { data: approvalResult, error: approvalError } =
    await supabaseAdmin.rpc(
      "approve_manual_payment",
      {
        payment_uuid: paymentId,
      }
    );

  if (approvalError) {
    console.error(
      "Approve Manual Payment RPC Error:",
      approvalError
    );

    throw new Error(
      approvalError.message ||
        "Unable to approve manual payment."
    );
  }

  // Fetch the payment again after successful approval.
  const { data: approvedPayment, error: approvedPaymentError } =
    await supabaseAdmin
      .from("payments")
      .select(
        `
        id,
        user_id,
        amount,
        currency,
        provider,
        reference,
        status,
        plan,
        payment_method,
        customer_note,
        created_at
      `
      )
      .eq("id", paymentId)
      .single();

  if (approvedPaymentError || !approvedPayment) {
    throw new Error(
      "Payment was approved, but the approved payment record could not be loaded."
    );
  }

  // Affiliate commission is created ONLY after payment approval.
  let commissionResult: unknown = null;
  let commissionWarning: string | null = null;

  if (
    approvedPayment.user_id &&
    approvedPayment.reference &&
    approvedPayment.plan
  ) {
    try {
      commissionResult = await createCommission({
        referredUserId: approvedPayment.user_id,
        paymentReference: approvedPayment.reference,
        plan: approvedPayment.plan,
        paymentAmount: Number(approvedPayment.amount),
        currency: approvedPayment.currency ?? "NGN",
      });
    } catch (commissionError) {
      console.error(
        "Manual Payment Commission Error:",
        commissionError
      );

      commissionWarning =
        commissionError instanceof Error
          ? commissionError.message
          : "Affiliate commission could not be created.";
    }
  }

  return {
    success: true,
    payment: approvedPayment,
    approval: approvalResult,
    commission: commissionResult,
    commissionWarning,
  };
}

export async function rejectManualPayment(
  paymentId: string
) {
  if (!paymentId || typeof paymentId !== "string") {
    throw new Error("Payment ID is required.");
  }

  // Conditional update makes rejection safe against races:
  // only a MANUAL + PENDING payment can be rejected.
  const { data: rejectedPayment, error } =
    await supabaseAdmin
      .from("payments")
      .update({
        status: "FAILED",
      })
      .eq("id", paymentId)
      .eq("provider", "MANUAL")
      .eq("status", "PENDING")
      .select(
        `
        id,
        user_id,
        amount,
        currency,
        provider,
        reference,
        status,
        plan,
        payment_method,
        customer_note,
        created_at
      `
      )
      .single();

  if (error || !rejectedPayment) {
    console.error(
      "Reject Manual Payment Error:",
      error
    );

    throw new Error(
      "Payment could not be rejected. It may no longer be pending."
    );
  }

  return rejectedPayment;
}