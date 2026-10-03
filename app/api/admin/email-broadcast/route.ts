import { NextResponse } from "next/server";
import { Resend } from "resend";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { supabaseAdmin } from "@/lib/supabase/admin";

const BATCH_SIZE = 100;

export async function POST(req: Request) {
  try {
    const adminUser = await requireAdmin();

    const body = await req.json();

    const subject =
      typeof body?.subject === "string"
        ? body.subject.trim()
        : "";

    const message =
      typeof body?.message === "string"
        ? body.message.trim()
        : "";

    const testOnly = body?.testOnly === true;

    if (!subject || !message) {
      return NextResponse.json(
        {
          success: false,
          error: "Subject and message are required.",
        },
        { status: 400 }
      );
    }

    if (subject.length > 200) {
      return NextResponse.json(
        {
          success: false,
          error: "Subject is too long. Maximum 200 characters.",
        },
        { status: 400 }
      );
    }

    if (message.length > 10000) {
      return NextResponse.json(
        {
          success: false,
          error: "Message is too long. Maximum 10,000 characters.",
        },
        { status: 400 }
      );
    }

    const resendApiKey = process.env.RESEND_API_KEY;

    if (!resendApiKey) {
      console.error("RESEND_API_KEY is not configured.");

      return NextResponse.json(
        {
          success: false,
          error: "Email service is not configured.",
        },
        { status: 500 }
      );
    }

    const resend = new Resend(resendApiKey);

    // Safe test mode: send only to the authenticated admin.
    if (testOnly) {
      const adminEmail =
  typeof adminUser.user?.email === "string"
    ? adminUser.user.email.trim()
    : "";

      if (!adminEmail) {
        return NextResponse.json(
          {
            success: false,
            error: "The administrator account does not have a valid email address.",
          },
          { status: 400 }
        );
      }

      const { data, error } = await resend.emails.send({
        from: "SONET AI STUDIO <support@sonetaistudio.com>",
        to: [adminEmail],
        subject,
        text: message,
      });

      if (error) {
        console.error("Broadcast test email failed:", error);

        return NextResponse.json(
          {
            success: false,
            error: "Test email could not be sent.",
          },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        test: true,
        message: "Test email sent successfully.",
        recipient: adminEmail,
        id: data?.id ?? null,
      });
    }

    // Normal broadcast mode: retrieve all registered users with email addresses.
    const { data: users, error: usersError } = await supabaseAdmin
      .from("profiles")
      .select("email")
      .not("email", "is", null);

    if (usersError) {
      console.error("Broadcast recipient query error:", usersError);

      return NextResponse.json(
        {
          success: false,
          error: "Unable to retrieve users.",
        },
        { status: 500 }
      );
    }

    const recipients = Array.from(
      new Set(
        (users ?? [])
          .map((user) =>
            typeof user.email === "string"
              ? user.email.trim().toLowerCase()
              : ""
          )
          .filter(Boolean)
      )
    );

    if (recipients.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "No users with valid email addresses were found.",
        },
        { status: 400 }
      );
    }

    let sent = 0;
    let failed = 0;

    for (let i = 0; i < recipients.length; i += BATCH_SIZE) {
      const batchRecipients = recipients.slice(
        i,
        i + BATCH_SIZE
      );

      const batch = batchRecipients.map((recipient) => ({
        from: "SONET AI STUDIO <support@sonetaistudio.com>",
        to: [recipient],
        subject,
        text: message,
      }));

      const { data, error } = await resend.batch.send(batch);

      if (error) {
        console.error(
          `Broadcast batch failed for recipients ${i + 1}-${i + batchRecipients.length}:`,
          error
        );

        failed += batchRecipients.length;
        continue;
      }

      sent += data?.length ?? batchRecipients.length;
    }

    return NextResponse.json({
      success: true,
      test: false,
      message: "Broadcast email process completed.",
      recipients: recipients.length,
      sent,
      failed,
    });
  } catch (error) {
    console.error("Admin broadcast email error:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Unable to send broadcast email.",
      },
      { status: 500 }
    );
  }
}
