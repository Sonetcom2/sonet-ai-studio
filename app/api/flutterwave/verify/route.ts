
import { createClient } from "@/lib/supabase/server";
import {
  getFlutterwaveAccessToken,
} from "@/services/flutterwaveService";
import { NextResponse } from "next/server";

const PLAN_AMOUNTS: Record<string, number> = {
  PRO: 5000,
  PREMIUM: 25000,
};

export async function POST(request: Request) {
  try {
    const {
      transactionId,
      reference,
      plan,
    } = await request.json();

    if (
      plan !== "PRO" &&
      plan !== "PREMIUM"
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid subscription plan.",
        },
        { status: 400 }
      );
    }

    if (!transactionId) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Flutterwave transaction ID is missing.",
        },
        { status: 400 }
      );
    }

    if (!reference) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Flutterwave transaction reference is missing.",
        },
        { status: 400 }
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

    const accessToken =
      await getFlutterwaveAccessToken();

    /*
     * Verify the transaction using
     * Flutterwave V4.
     */
    const response = await fetch(
      `https://api.flutterwave.com/v4/transactions/${encodeURIComponent(
        transactionId
      )}/verify`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        cache: "no-store",
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error(
        "Flutterwave V4 verification error:",
        response.status,
        data
      );

      return NextResponse.json(
        {
          success: false,
          error:
            data?.message ||
            data?.error ||
            "Unable to verify Flutterwave payment.",
        },
        { status: 400 }
      );
    }

    console.log(
      "Flutterwave V4 verification response:",
      JSON.stringify(data, null, 2)
    );

    const transaction =
      data?.data || data?.transaction;

    if (!transaction) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Flutterwave returned an invalid verification response.",
        },
        { status: 502 }
      );
    }

    /*
     * Confirm transaction status.
     */
    const transactionStatus =
      transaction.status ||
      transaction.payment_status;

    if (
      transactionStatus !== "successful" &&
      transactionStatus !== "completed"
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            `Payment was not successful. Current status: ${transactionStatus || "unknown"}.`,
        },
        { status: 400 }
      );
    }

    /*
     * Confirm the transaction reference.
     */
    const returnedReference =
      transaction.tx_ref ||
      transaction.reference;

    if (
      returnedReference &&
      returnedReference !== reference
    ) {
      console.error(
        "Flutterwave reference mismatch:",
        {
          expected: reference,
          received: returnedReference,
        }
      );

      return NextResponse.json(
        {
          success: false,
          error:
            "Payment reference verification failed.",
        },
        { status: 400 }
      );
    }

    /*
     * Confirm the amount.
     */
    const expectedAmount =
      PLAN_AMOUNTS[plan];

    const paidAmount = Number(
      transaction.amount
    );

    if (
      !Number.isFinite(paidAmount) ||
      paidAmount < expectedAmount
    ) {
      console.error(
        "Flutterwave amount mismatch:",
        {
          expectedAmount,
          paidAmount,
        }
      );

      return NextResponse.json(
        {
          success: false,
          error:
            "Payment amount verification failed.",
        },
        { status: 400 }
      );
    }

    /*
     * Confirm currency.
     */
    const currency =
      transaction.currency;

    if (currency !== "NGN") {
      return NextResponse.json(
        {
          success: false,
          error:
            "Payment currency verification failed.",
        },
        { status: 400 }
      );
    }

    /*
     * Prevent a payment belonging to another
     * customer from activating this account.
     */
    const customerEmail =
      transaction.customer?.email ||
      transaction.customer_email;

    if (
      customerEmail &&
      user.email &&
      customerEmail.toLowerCase() !==
        user.email.toLowerCase()
    ) {
      console.error(
        "Flutterwave customer mismatch:",
        {
          expected: user.email,
          received: customerEmail,
        }
      );

      return NextResponse.json(
        {
          success: false,
          error:
            "Payment customer verification failed.",
        },
        { status: 400 }
      );
    }

    /*
     * Extract the transaction metadata.
     */
    const metadata =
      transaction.meta ||
      transaction.metadata ||
      {};

    if (
      metadata.user_id &&
      metadata.user_id !== user.id
    ) {
      console.error(
        "Flutterwave user mismatch:",
        {
          expected: user.id,
          received: metadata.user_id,
        }
      );

      return NextResponse.json(
        {
          success: false,
          error:
            "Payment account verification failed.",
        },
        { status: 400 }
      );
    }

    if (
      metadata.plan &&
      metadata.plan !== plan
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Payment subscription plan verification failed.",
        },
        { status: 400 }
      );
    }

    /*
     * IMPORTANT:
     *
     * At this point the Flutterwave transaction
     * has been independently verified.
     *
     * The next step is to update the existing
     * SONET AI STUDIO subscription/credits
     * system.
     *
     * We intentionally do not invent a database
     * table here. Your existing subscription
     * architecture should be reused.
     */

    console.log(
      "Verified Flutterwave V4 payment:",
      {
        userId: user.id,
        email: user.email,
        plan,
        amount: paidAmount,
        reference,
        transactionId,
      }
    );

    return NextResponse.json({
      success: true,
      message:
        "Flutterwave payment verified successfully.",
      plan,
      amount: paidAmount,
      currency: "NGN",
      reference,
      transactionId,
    });
  } catch (error: unknown) {
    console.error(
      "Flutterwave V4 verification error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Flutterwave payment verification failed.",
      },
      { status: 500 }
    );
  }
}