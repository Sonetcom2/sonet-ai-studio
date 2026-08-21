import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { getAffiliateByUserId } from "@/services/referralService";

const MINIMUM_WITHDRAWAL = 1000;

function generateReference() {
  return `WD-${Date.now()}-${Math.random()
    .toString(36)
    .substring(2, 8)
    .toUpperCase()}`;
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    // ---------------------------------------------
    // 1. Verify authenticated user
    // ---------------------------------------------

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized.",
        },
        { status: 401 }
      );
    }

    // ---------------------------------------------
    // 2. Get affiliate profile
    // ---------------------------------------------

    const affiliate = await getAffiliateByUserId(user.id);

    if (!affiliate) {
      return NextResponse.json(
        {
          success: false,
          error: "Affiliate profile not found.",
        },
        { status: 404 }
      );
    }

    if (affiliate.status !== "active") {
      return NextResponse.json(
        {
          success: false,
          error: "Your affiliate account is not active.",
        },
        { status: 403 }
      );
    }

    // ---------------------------------------------
    // 3. Read request
    // ---------------------------------------------

    const body = await request.json();

    const amount = Number(body.amount);
    const bankName = String(body.bankName ?? "").trim();
    const accountName = String(body.accountName ?? "").trim();
    const accountNumber = String(body.accountNumber ?? "").trim();

    // ---------------------------------------------
    // 4. Validate amount
    // ---------------------------------------------

    if (!Number.isFinite(amount)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid withdrawal amount.",
        },
        { status: 400 }
      );
    }

    if (amount < MINIMUM_WITHDRAWAL) {
      return NextResponse.json(
        {
          success: false,
          error: `Minimum withdrawal amount is ₦${MINIMUM_WITHDRAWAL.toLocaleString(
            "en-NG"
          )}.`,
        },
        { status: 400 }
      );
    }

    if (!Number.isInteger(amount)) {
      return NextResponse.json(
        {
          success: false,
          error: "Withdrawal amount must be a whole number.",
        },
        { status: 400 }
      );
    }

    // ---------------------------------------------
    // 5. Validate bank information
    // ---------------------------------------------

    if (!bankName || !accountName || !accountNumber) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Bank name, account name and account number are required.",
        },
        { status: 400 }
      );
    }

    if (!/^\d{10}$/.test(accountNumber)) {
      return NextResponse.json(
        {
          success: false,
          error: "Account number must contain exactly 10 digits.",
        },
        { status: 400 }
      );
    }

    // ---------------------------------------------
    // 6. Check available earnings
    // ---------------------------------------------

    const availableBalance = Number(
      affiliate.pending_earnings
    );

    if (
      !Number.isFinite(availableBalance) ||
      availableBalance < amount
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Insufficient available earnings.",
        },
        { status: 400 }
      );
    }

    // ---------------------------------------------
    // 7. Prevent duplicate pending requests
    // ---------------------------------------------

    const { data: existingWithdrawal, error: existingError } =
      await supabaseAdmin
        .from("affiliate_withdrawals")
        .select("id, amount, status")
        .eq("affiliate_id", affiliate.id)
        .in("status", ["pending", "processing"])
        .maybeSingle();

    if (existingError) {
      console.error(
        "Check existing withdrawal error:",
        existingError
      );

      return NextResponse.json(
        {
          success: false,
          error: "Unable to verify existing withdrawal requests.",
        },
        { status: 500 }
      );
    }

    if (existingWithdrawal) {
      return NextResponse.json(
        {
          success: false,
          error:
            "You already have a withdrawal request being processed.",
        },
        { status: 409 }
      );
    }

    // ---------------------------------------------
    // 8. Generate unique reference
    // ---------------------------------------------

    const reference = generateReference();

    // ---------------------------------------------
    // 9. Create withdrawal request
    // ---------------------------------------------

    const { data: withdrawal, error: withdrawalError } =
      await supabaseAdmin
        .from("affiliate_withdrawals")
        .insert({
          affiliate_id: affiliate.id,
          user_id: user.id,
          amount,
          currency: "NGN",
          bank_name: bankName,
          account_name: accountName,
          account_number: accountNumber,
          status: "pending",
          reference,
        })
        .select(
          `
            id,
            amount,
            currency,
            bank_name,
            account_name,
            account_number,
            status,
            reference,
            requested_at
          `
        )
        .single();

    if (withdrawalError) {
      console.error(
        "Create withdrawal error:",
        withdrawalError
      );

      return NextResponse.json(
        {
          success: false,
          error: "Unable to create withdrawal request.",
        },
        { status: 500 }
      );
    }

    // ---------------------------------------------
    // 10. Reserve the requested earnings
    // ---------------------------------------------

    const newPendingBalance =
      availableBalance - amount;

    const { error: balanceError } =
      await supabaseAdmin
        .from("affiliate_profiles")
        .update({
          pending_earnings: newPendingBalance,
          updated_at: new Date().toISOString(),
        })
        .eq("id", affiliate.id)
        .eq("user_id", user.id);

    if (balanceError) {
      console.error(
        "Reserve affiliate earnings error:",
        balanceError
      );

      // Roll back withdrawal if balance update fails.
      await supabaseAdmin
        .from("affiliate_withdrawals")
        .delete()
        .eq("id", withdrawal.id);

      return NextResponse.json(
        {
          success: false,
          error:
            "Unable to reserve earnings. Withdrawal was not created.",
        },
        { status: 500 }
      );
    }

    // ---------------------------------------------
    // 11. Success
    // ---------------------------------------------

    return NextResponse.json({
      success: true,
      message:
        "Withdrawal request submitted successfully.",
      withdrawal,
      availableBalance: newPendingBalance,
    });
  } catch (error) {
    console.error(
      "Affiliate withdrawal API error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Unable to process withdrawal request.",
      },
      { status: 500 }
    );
  }
}