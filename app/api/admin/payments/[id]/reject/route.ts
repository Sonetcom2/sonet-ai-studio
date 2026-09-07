import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { rejectManualPayment } from "@/services/adminManualPaymentService";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function POST(
  request: Request,
  context: RouteContext
) {
  try {
    await requireAdmin();

    const { id } = await context.params;

    if (!id || typeof id !== "string") {
      return NextResponse.json(
        {
          success: false,
          error: "Payment ID is required.",
        },
        { status: 400 }
      );
    }

    const payment = await rejectManualPayment(id);

    return NextResponse.json({
      success: true,
      message: "Manual payment rejected successfully.",
      payment,
    });
  } catch (error) {
    console.error(
      "Reject Manual Payment API Error:",
      error
    );

    if (
      error instanceof Error &&
      error.message === "UNAUTHORIZED"
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized.",
        },
        { status: 401 }
      );
    }

    if (
      error instanceof Error &&
      error.message === "FORBIDDEN"
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Admin access required.",
        },
        { status: 403 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to reject manual payment.",
      },
      { status: 500 }
    );
  }
}