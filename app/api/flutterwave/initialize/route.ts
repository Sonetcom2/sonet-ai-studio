
import { createClient } from "@/lib/supabase/server";
import { getFlutterwaveAccessToken } from "@/services/flutterwaveService";
import { NextResponse } from "next/server";

const PLAN_AMOUNTS: Record<"PRO" | "PREMIUM", number> = {
  PRO: 5000,
  PREMIUM: 25000,
};

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const requestedPlan = body?.plan;

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

    const plan: "PRO" | "PREMIUM" = requestedPlan;
    const amount = PLAN_AMOUNTS[plan];

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

    const appUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      "http://localhost:3000";

    const redirectUrl =
      `${appUrl}/checkout/flutterwave/callback`;

    const txRef =
      `SONET-FW-${plan}-${Date.now()}-${crypto
        .randomUUID()
        .replace(/-/g, "")
        .slice(0, 8)}`;

    const accessToken =
      await getFlutterwaveAccessToken();

    /*
     * Flutterwave V4 Orchestrator
     *
     * IMPORTANT:
     * The V4 API requires a payment_method object.
     *
     * We use card as the initial payment method.
     * Flutterwave can return a redirect/authorization
     * action which the customer completes.
     */
    const payload = {
      amount,
      currency: "NGN",
      reference: txRef,

      customer: {
        email: user.email,
      },

      payment_method: {
        type: "card",
      },

      redirect_url: redirectUrl,

      meta: {
        user_id: user.id,
        plan,
      },
    };

    console.log(
      "Flutterwave V4 initialize request:",
      {
        reference: txRef,
        plan,
        amount,
        currency: "NGN",
        redirectUrl,
        userEmail: user.email,
      }
    );

    const response = await fetch(
      "https://api.flutterwave.com/orchestration/direct-charges",
      {
        method: "POST",

        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",

          "X-Trace-Id": crypto.randomUUID(),

          "X-Idempotency-Key":
            crypto.randomUUID(),
        },

        body: JSON.stringify(payload),

        cache: "no-store",
      }
    );

    const contentType =
      response.headers.get("content-type") || "";

    const rawBody = await response.text();

    console.log(
      "Flutterwave V4 initialize response:",
      {
        status: response.status,
        contentType,
        body: rawBody.slice(0, 3000),
      }
    );

    if (
      !contentType.includes("application/json")
    ) {
      console.error(
        "Flutterwave returned non-JSON:",
        rawBody
      );

      return NextResponse.json(
        {
          success: false,
          error:
            `Flutterwave returned a non-JSON response (${response.status}).`,
        },
        { status: 502 }
      );
    }

    let data: unknown;

    try {
      data = JSON.parse(rawBody);
    } catch {
      console.error(
        "Flutterwave returned invalid JSON:",
        rawBody
      );

      return NextResponse.json(
        {
          success: false,
          error:
            "Flutterwave returned invalid JSON.",
        },
        { status: 502 }
      );
    }

    if (!response.ok) {
      console.error(
        "Flutterwave V4 initialization error:",
        {
          status: response.status,
          data,
        }
      );

      const errorData = data as {
        message?: string;
        error?: {
          message?: string;
          type?: string;
          code?: string;
        };
      };

      return NextResponse.json(
        {
          success: false,
          error:
            errorData?.error?.message ||
            errorData?.message ||
            "Unable to initialize Flutterwave payment.",
        },
        { status: response.status }
      );
    }

    const responseData = data as {
      status?: string;
      message?: string;
      data?: {
        id?: string;
        status?: string;
        reference?: string;
        next_action?: {
          type?: string;
          redirect_url?: {
            url?: string;
          };
        };
      };
    };

    const charge =
      responseData?.data;

    const redirectPaymentUrl =
      charge?.next_action?.redirect_url?.url;

    /*
     * V4 may return different next_action types.
     * For browser-based authorization, redirect_url
     * is the URL the customer must visit.
     */
    if (!redirectPaymentUrl) {
      console.error(
        "Flutterwave V4 did not return a redirect URL:",
        JSON.stringify(data, null, 2)
      );

      return NextResponse.json(
        {
          success: false,
          error:
            "Flutterwave initialized the payment but did not return a payment authorization URL.",
          flutterwaveStatus:
            responseData?.status,
          nextAction:
            charge?.next_action || null,
        },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,

      checkoutUrl:
        redirectPaymentUrl,

      reference: txRef,

      transactionId:
        charge?.id || null,

      plan,

      amount,

      currency: "NGN",

      nextAction:
        charge?.next_action || null,
    });
  } catch (error: unknown) {
    console.error(
      "Flutterwave V4 initialization exception:",
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
