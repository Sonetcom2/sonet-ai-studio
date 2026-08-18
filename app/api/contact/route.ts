import { NextResponse } from "next/server";
import { Resend } from "resend";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const name =
      typeof body?.name === "string"
        ? body.name.trim()
        : "";

    const email =
      typeof body?.email === "string"
        ? body.email.trim()
        : "";

    const subject =
      typeof body?.subject === "string"
        ? body.subject.trim()
        : "";

    const message =
      typeof body?.message === "string"
        ? body.message.trim()
        : "";

    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        {
          success: false,
          error: "All fields are required.",
        },
        { status: 400 }
      );
    }

    if (name.length > 100) {
      return NextResponse.json(
        {
          success: false,
          error: "Name is too long.",
        },
        { status: 400 }
      );
    }

    if (subject.length > 200) {
      return NextResponse.json(
        {
          success: false,
          error: "Subject is too long.",
        },
        { status: 400 }
      );
    }

    if (message.length > 5000) {
      return NextResponse.json(
        {
          success: false,
          error: "Message is too long.",
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
          error: "Email service is not configured yet.",
        },
        { status: 500 }
      );
    }

    const resend = new Resend(resendApiKey);

    const recipient =
      process.env.CONTACT_EMAIL ||
      "supportsonetaistudio@gmail.com";

    const { error } = await resend.emails.send({
      from: "SONET AI STUDIO <support@sonetaistudio.com>",
      to: recipient,
      replyTo: email,
      subject: `[SONET Contact] ${subject}`,
      text: `
New message from SONET AI STUDIO contact form

Name: ${name}
Email: ${email}
Subject: ${subject}

Message:
${message}
      `.trim(),
    });

    if (error) {
      console.error("Resend email error:", error);

      return NextResponse.json(
        {
          success: false,
          error: "Unable to send your message right now.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Message sent successfully.",
    });
  } catch (error) {
    console.error("Contact API error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Unable to process your message.",
      },
      { status: 500 }
    );
  }
}