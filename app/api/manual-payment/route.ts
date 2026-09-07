import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { getSettings } from "@/services/settingsService";
import { NextResponse } from "next/server";

type ManualPaymentPlan = "PRO" | "PREMIUM";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const requestedPlan = String(body?.plan ?? "")
      .trim()
      .toUpperCase();

    const customerNote = String(body?.customerNote ?? "").trim();

    if (
      requestedPlan !== "PRO" &&
      requestedPlan !== "PREMIUM"
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid subscription plan.",
        },
        { status: 400 }
      );
    }

    if (customerNote.length > 1000) {
      return NextResponse.json(
        {
          success: false,
          error: "Payment note is too long.",
        },
        { status: 400 }
      );
    }

    // --------------------------------------------------
    // 1. Authenticate the customer
    // --------------------------------------------------

    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized.",
        },
        { status: 401 }
      );
    }

    // --------------------------------------------------
    // 2. Read trusted pricing from Admin Settings
    // --------------------------------------------------

    const settings = await getSettings();

    const plan = requestedPlan as ManualPaymentPlan;

    const amount =
      plan === "PRO"
        ? Number(settings.pro_price)
        : Number(settings.premium_price);

    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json(
        {
          success: false,
          error: "The selected plan is not currently available.",
        },
        { status: 400 }
      );
    }

    // --------------------------------------------------
    // 3. Generate a server-side payment reference
    // --------------------------------------------------

    const reference = `SONET-MANUAL-${plan}-${Date.now()}-${crypto
      .randomUUID()
      .replace(/-/g, "")
      .slice(0, 12)
      .toUpperCase()}`;

    // --------------------------------------------------
    // 4. Create a PENDING payment
    // --------------------------------------------------

    const { data: payment, error: paymentError } =
      await supabaseAdmin
        .from("payments")
        .insert({
          user_id: user.id,
          amount,
          currency: "NGN",
          provider: "MANUAL",
          reference,
          status: "PENDING",
          plan,
          payment_method: "BANK_TRANSFER",
          customer_note: customerNote || null,
        })
        .select(
          "id, user_id, amount, currency, provider, reference, status, plan, payment_method, customer_note, created_at"
        )
        .single();

    if (paymentError) {
      console.error(
        "Create Manual Payment Error:",
        paymentError
      );

      return NextResponse.json(
        {
          success: false,
          error: "Unable to create manual payment request.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message:
        "Manual payment request created successfully.",
      payment,
    });
  } catch (error: unknown) {
    console.error(
      "Manual Payment Submission Error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Unable to submit manual payment.",
      },
      { status: 500 }
    );
  }
}