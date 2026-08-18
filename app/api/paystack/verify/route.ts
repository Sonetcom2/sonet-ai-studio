
import { createClient } from "@/lib/supabase/server";
import { getSubscriptionDetails } from "@/lib/subscription";
import {
  isDuplicatePayment,
  isSuccessfulPayment,
} from "@/lib/payments";
import { createCommission } from "@/services/commissionService";
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

    if (plan !== "PRO" && plan !== "PREMIUM") {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid subscription plan.",
        },
        { status: 400 }
      );
    }

    // --------------------------------------------------
    // 1. Verify transaction with Paystack
    // --------------------------------------------------

    const response = await fetch(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(
        reference
      )}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
        cache: "no-store",
      }
    );

    const data = await response.json();

    if (!response.ok || !data?.data) {
      return NextResponse.json(
        {
          success: false,
          error:
            data?.message ||
            "Unable to verify payment with Paystack.",
        },
        { status: 400 }
      );
    }

    const payment = data.data;

    // --------------------------------------------------
    // 2. Payment must actually be successful
    // --------------------------------------------------

    if (!isSuccessfulPayment(payment.status)) {
      return NextResponse.json(
        {
          success: false,
          error: "Payment was not successful.",
        },
        { status: 400 }
      );
    }

    // --------------------------------------------------
    // 3. Get authenticated user
    // --------------------------------------------------

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

    // --------------------------------------------------
    // 4. Validate payment reference
    // --------------------------------------------------

    if (!payment.reference) {
      return NextResponse.json(
        {
          success: false,
          error: "Paystack returned an invalid payment reference.",
        },
        { status: 400 }
      );
    }

    // --------------------------------------------------
    // 5. Validate amount
    //
    // Paystack amounts are in kobo.
    //
    // PRO     = ₦5,000  = 500,000 kobo
    // PREMIUM = ₦25,000 = 2,500,000 kobo
    // --------------------------------------------------

    const expectedAmount =
      plan === "PRO"
        ? 500000
        : 2500000;

    if (Number(payment.amount) !== expectedAmount) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Payment amount does not match the selected plan.",
        },
        { status: 400 }
      );
    }

    // --------------------------------------------------
    // 6. Determine subscription
    // --------------------------------------------------

    const selectedPlan = plan;

    const subscription =
      getSubscriptionDetails(selectedPlan);

    // --------------------------------------------------
    // 7. Check whether this payment was already processed
    // --------------------------------------------------

    const {
      data: existingPayment,
      error: existingPaymentError,
    } = await supabase
      .from("payments")
      .select("id")
      .eq("reference", payment.reference)
      .maybeSingle();

    if (existingPaymentError) {
      return NextResponse.json(
        {
          success: false,
          error: existingPaymentError.message,
        },
        { status: 500 }
      );
    }

    // --------------------------------------------------
    // 8. If payment already exists, make sure its
    //    affiliate commission also exists.
    //
    // This makes the commission flow safer if the first
    // request succeeded at payment insertion but failed
    // while creating the commission.
    // --------------------------------------------------

    if (isDuplicatePayment(existingPayment)) {
      try {
        await createCommission({
          referredUserId: user.id,
          paymentReference: payment.reference,
          plan: subscription.plan,
          paymentAmount:
            Number(payment.amount) / 100,
          currency:
            payment.currency || "NGN",
        });
      } catch (commissionError) {
        console.error(
          "Affiliate commission recovery error:",
          commissionError
        );
      }

      return NextResponse.json(
        {
          success: true,
          alreadyProcessed: true,
          message:
            "Payment was already processed.",
          plan: subscription.plan,
          credits: subscription.credits,
        }
      );
    }

    // --------------------------------------------------
    // 9. Activate user's subscription
    // --------------------------------------------------

    const { error: profileError } =
      await supabase
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

    // --------------------------------------------------
    // 10. Record successful payment
    // --------------------------------------------------

    const { error: paymentError } =
      await supabase
        .from("payments")
        .insert({
          user_id: user.id,
          reference: payment.reference,
          amount: payment.amount,
          currency:
            payment.currency || "NGN",
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

    // --------------------------------------------------
    // 11. Create affiliate commission
    //
    // payment.amount is in kobo.
    // commissionService receives the actual currency
    // amount in NGN.
    //
    // Example:
    // ₦5,000 × 20% = ₦1,000
    // --------------------------------------------------

    try {
      const commissionResult =
        await createCommission({
          referredUserId: user.id,
          paymentReference: payment.reference,
          plan: subscription.plan,
          paymentAmount:
            Number(payment.amount) / 100,
          currency:
            payment.currency || "NGN",
        });

      if (commissionResult.created) {
        console.log(
          "Affiliate commission created:",
          commissionResult.commission?.id
        );
      } else {
        console.log(
          "No affiliate commission created:",
          commissionResult.reason || "NO_REFERRAL"
        );
      }
    } catch (commissionError) {
      // The payment itself was successful and already
      // recorded. Do not tell the customer their payment
      // failed because affiliate processing had an issue.
      console.error(
        "Affiliate commission creation error:",
        commissionError
      );
    }

    // --------------------------------------------------
    // 12. Return successful response
    // --------------------------------------------------

    return NextResponse.json({
      success: true,
      message:
        "Subscription activated successfully.",
      plan: subscription.plan,
      credits: subscription.credits,
    });
  } catch (error: unknown) {
    console.error(
      "Paystack verification error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Payment verification failed.",
      },
      { status: 500 }
    );
  }
}
