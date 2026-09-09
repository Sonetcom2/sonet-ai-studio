import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET(req: Request) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: "Please log in.",
        },
        { status: 401 }
      );
    }

    const url = new URL(req.url);
    const conversationId =
      url.searchParams.get("conversationId");

    // ==========================================
    // LOAD ONE CONVERSATION
    // ==========================================

    if (conversationId) {
      const { data: conversation, error: conversationError } =
        await supabaseAdmin
          .from("ai_conversations")
          .select("*")
          .eq("id", conversationId)
          .eq("user_id", user.id)
          .single();

      if (conversationError || !conversation) {
        return NextResponse.json(
          {
            success: false,
            error: "Conversation not found.",
          },
          { status: 404 }
        );
      }

      const { data: messages, error: messagesError } =
        await supabaseAdmin
          .from("ai_messages")
          .select("id, role, content, created_at")
          .eq("conversation_id", conversationId)
          .eq("user_id", user.id)
          .order("created_at", {
            ascending: true,
          });

      if (messagesError) {
        console.error(
          "AI History Messages Error:",
          messagesError
        );

        return NextResponse.json(
          {
            success: false,
            error: "Unable to load conversation.",
          },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        conversation,
        messages: messages ?? [],
      });
    }

    // ==========================================
    // LOAD USER CONVERSATIONS
    // ==========================================

    const { data: conversations, error } =
      await supabaseAdmin
        .from("ai_conversations")
        .select(
          "id, title, created_at, updated_at"
        )
        .eq("user_id", user.id)
        .order("updated_at", {
          ascending: false,
        });

    if (error) {
      console.error(
        "AI History List Error:",
        error
      );

      return NextResponse.json(
        {
          success: false,
          error: "Unable to load chat history.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      conversations: conversations ?? [],
    });
  } catch (error) {
    console.error(
      "AI History GET Error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error: "Unable to load chat history.",
      },
      { status: 500 }
    );
  }
}

// ==========================================
// CREATE NEW CONVERSATION
// ==========================================

export async function POST() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: "Please log in.",
        },
        { status: 401 }
      );
    }

    const { data, error } =
      await supabaseAdmin
        .from("ai_conversations")
        .insert({
          user_id: user.id,
          title: "New Chat",
        })
        .select(
          "id, title, created_at, updated_at"
        )
        .single();

    if (error) {
      console.error(
        "Create AI Conversation Error:",
        error
      );

      return NextResponse.json(
        {
          success: false,
          error: "Unable to create new chat.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      conversation: data,
    });
  } catch (error) {
    console.error(
      "AI History POST Error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error: "Unable to create new chat.",
      },
      { status: 500 }
    );
  }
}

// ==========================================
// DELETE CONVERSATION
// ==========================================

export async function DELETE(req: Request) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: "Please log in.",
        },
        { status: 401 }
      );
    }

    const url = new URL(req.url);
    const conversationId =
      url.searchParams.get("conversationId");

    if (!conversationId) {
      return NextResponse.json(
        {
          success: false,
          error: "Conversation ID is required.",
        },
        { status: 400 }
      );
    }

    const { error } = await supabaseAdmin
      .from("ai_conversations")
      .delete()
      .eq("id", conversationId)
      .eq("user_id", user.id);

    if (error) {
      console.error(
        "Delete AI Conversation Error:",
        error
      );

      return NextResponse.json(
        {
          success: false,
          error: "Unable to delete conversation.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error(
      "AI History DELETE Error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error: "Unable to delete conversation.",
      },
      { status: 500 }
    );
  }
}