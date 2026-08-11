import { NextResponse } from "next/server";
import { getPaymentHistory } from "@/services/paymentService";

export async function GET() {
  try {
    const payments = await getPaymentHistory();

    return NextResponse.json({
      success: true,
      payments,
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