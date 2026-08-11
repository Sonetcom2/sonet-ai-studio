import { createClient } from "@/lib/supabase/server";
import { getSubscriptionDetails } from "@/lib/subscription";
import {
  isDuplicatePayment,
  isSuccessfulPayment,
} from "@/lib/payments";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { reference, plan } = await request.json();

    if (!reference) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing payment reference",
        },
        { status: 400 }
      );
    }

    const response = await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    const data = await response.json();
    const payment = data.data;
    const supabase = await createClient();

const {
  data: { user },
} = await supabase.auth.getUser();

if (!user) {
  return NextResponse.json(
    {
      success: false,
      error: "Unauthorized",
    },
    { status: 401 }
  );
}
const { data: existingPayment } = await supabase
  .from("payments")
  .select("id")
  .eq("reference", payment.reference)
  .maybeSingle();

if (isDuplicatePayment(existingPayment)) {
  return NextResponse.json(
    {
      success: false,
      error: "Payment already processed",
    },
    { status: 400 }
  );
}
let selectedPlan = "FREE";

if (payment.amount >= 2500000) {
  selectedPlan = "PREMIUM";
} else if (payment.amount >= 500000) {
  selectedPlan = "PRO";
}

const subscription = getSubscriptionDetails(selectedPlan);
const expectedAmount =
  plan === "PRO"
    ? 500000
    : plan === "PREMIUM"
    ? 2500000
    : 0;

if (payment.amount !== expectedAmount) {
  return NextResponse.json(
    {
      success: false,
      error: "Payment amount does not match the selected plan.",
    },
    { status: 400 }
  );
}
const { error: profileError } = await supabase
  .from("profiles")
  .update({
    plan: subscription.plan,
    credits: subscription.credits,
  })
  .eq("id", user.id);

if (profileError) {
  return NextResponse.json(
    {
      success: false,
      error: profileError.message,
    },
    { status: 500 }
  );
}
const { error: paymentError } = await supabase
  .from("payments")
  .insert({
    user_id: user.id,
    reference: payment.reference,
    amount: payment.amount,
    currency: "NGN",
    provider: "Paystack",
    status: payment.status,
  });
if (paymentError) {
  return NextResponse.json(
    {
      success: false,
      error: paymentError.message,
    },
    { status: 500 }
  );
}

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          error: data.message || "Verification failed",
        },
        { status: 400 }
      );
    }

    if (!isSuccessfulPayment(payment.status)) {
      return NextResponse.json(
        {
          success: false,
          error: "Payment was not successful",
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
  success: true,
  message: "Subscription activated successfully.",
  plan: subscription.plan,
  credits: subscription.credits,
});

  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}