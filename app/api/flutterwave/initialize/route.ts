
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

const PLAN_AMOUNTS: Record<string, number> = {
  PRO: 5000,
  PREMIUM: 25000,
};

export async function POST(request: Request) {
  try {
    const { plan } = await request.json();

    if (plan !== "PRO" && plan !== "PREMIUM") {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid subscription plan.",
        },
        { status: 400 }
      );
    }

    const secretKey =
      process.env.FLUTTERWAVE_SECRET_KEY;

    if (!secretKey) {
      return NextResponse.json(
        {
          success: false,
          error:
            "FLUTTERWAVE_SECRET_KEY is not configured.",
        },
        { status: 500 }
      );
    }

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

    if (!user.email) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Your account does not have an email address.",
        },
        { status: 400 }
      );
    }

    const amount = PLAN_AMOUNTS[plan];

    const txRef =
      `SONET-FW-${plan}-${Date.now()}-${crypto
        .randomUUID()
        .slice(0, 8)}`;

    const appUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      "http://localhost:3000";

    const redirectUrl =
      `${appUrl}/checkout/flutterwave/callback`;

    console.log(
      "Flutterwave hosted checkout request:",
      {
        plan,
        amount,
        currency: "NGN",
        reference: txRef,
        redirectUrl,
      }
    );

    /*
     * Flutterwave Standard / Hosted Checkout
     *
     * Official endpoint:
     * https://api.flutterwave.com/v3/payments
     *
     * Flutterwave returns:
     * data.link
     *
     * The customer is then redirected to that
     * hosted payment page.
     */
    const response = await fetch(
      "https://api.flutterwave.com/v3/payments",
      {
        method: "POST",

        headers: {
          Authorization: `Bearer ${secretKey}`,
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          tx_ref: txRef,

          amount,

          currency: "NGN",

          redirect_url: redirectUrl,

          payment_options:
            "card,banktransfer,ussd",

          customer: {
            email: user.email,
          },

          customizations: {
            title: "SONET AI STUDIO",
            description:
              `SONET AI STUDIO ${plan} subscription`,
          },

          meta: {
            user_id: user.id,
            plan,
          },

          configurations: {
            session_duration: 30,
            max_retry_attempt: 5,
          },
        }),

        cache: "no-store",
      }
    );

    const contentType =
      response.headers.get("content-type") || "";

    const rawBody = await response.text();

    console.log(
      "Flutterwave hosted checkout response:",
      {
        status: response.status,
        contentType,
        body: rawBody.slice(0, 2000),
      }
    );

    if (!contentType.includes("application/json")) {
      return NextResponse.json(
        {
          success: false,
          error:
            `Flutterwave returned a non-JSON response (${response.status}).`,
        },
        { status: 502 }
      );
    }

    let data: any;

    try {
      data = JSON.parse(rawBody);
    } catch {
      return NextResponse.json(
        {
          success: false,
          error:
            "Flutterwave returned invalid JSON.",
        },
        { status: 502 }
      );
    }

    if (
      !response.ok ||
      data?.status !== "success"
    ) {
      console.error(
        "Flutterwave hosted checkout error:",
        data
      );

      return NextResponse.json(
        {
          success: false,
          error:
            data?.message ||
            "Unable to initialize Flutterwave payment.",
        },
        { status: 400 }
      );
    }

    const checkoutUrl =
      data?.data?.link;

    if (!checkoutUrl) {
      console.error(
        "Flutterwave did not return hosted checkout URL:",
        data
      );

      return NextResponse.json(
        {
          success: false,
          error:
            "Flutterwave did not return a checkout link.",
        },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,

      checkoutUrl,

      reference: txRef,

      plan,

      amount,

      currency: "NGN",
    });
  } catch (error: unknown) {
    console.error(
      "Flutterwave hosted checkout initialization error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Unable to initialize Flutterwave payment.",
      },
      { status: 500 }
    );
  }
}