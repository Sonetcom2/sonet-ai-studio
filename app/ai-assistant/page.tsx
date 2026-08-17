"use client";

import { FormEvent, useEffect, useRef, useState } from "react";

type Message = {
  id: number;
  role: "user" | "assistant";
  content: string;
};

const INITIAL_MESSAGE: Message = {
  id: 1,
  role: "assistant",
  content:
    "Hello! 👋 I'm SONET AI Assistant. How can I help you today?",
};

export default function AIAssistantPage() {
  const [messages, setMessages] = useState<Message[]>([
    INITIAL_MESSAGE,
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, loading]);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const message = input.trim();

    if (!message || loading) {
      return;
    }

    const userMessage: Message = {
      id: Date.now(),
      role: "user",
      content: message,
    };

    setMessages((current) => [
      ...current,
      userMessage,
    ]);

    setInput("");
    setLoading(true);

    try {
      const response = await fetch(
        "/api/ai-assistant",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.error ||
            "Unable to get an AI response."
        );
      }

      const assistantMessage: Message = {
        id: Date.now() + 1,
        role: "assistant",
        content:
          data.answer ||
          "I couldn't generate a response.",
      };

      setMessages((current) => [
        ...current,
        assistantMessage,
      ]);
    } catch (error) {
      console.error(
        "SONET AI Assistant error:",
        error
      );

      const errorMessage: Message = {
        id: Date.now() + 1,
        role: "assistant",
        content:
          error instanceof Error
            ? error.message
            : "Something went wrong. Please try again.",
      };

      setMessages((current) => [
        ...current,
        errorMessage,
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleClearChat() {
    setMessages([
      {
        id: Date.now(),
        role: "assistant",
        content:
          "Chat cleared. How can I help you?",
      },
    ]);

    setInput("");
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-cyan-500/10 text-2xl">
              🤖
            </div>

            <div>
              <h1 className="text-2xl font-bold sm:text-3xl">
                SONET AI Assistant
              </h1>

              <p className="text-sm text-slate-400">
                Your AI creative and business assistant
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClearChat}
            disabled={loading}
            className="rounded-xl border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-300 transition hover:border-cyan-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            Clear Chat
          </button>
        </div>

        {/* Chat */}
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-3xl border border-slate-800 bg-slate-900 shadow-2xl">
          {/* Messages */}
          <div className="flex-1 space-y-6 overflow-y-auto p-4 sm:p-6">
            {messages.map((message) => {
              const isUser =
                message.role === "user";

              return (
                <div
                  key={message.id}
                  className={`flex ${
                    isUser
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[90%] rounded-2xl px-4 py-3 sm:max-w-[75%] ${
                      isUser
                        ? "bg-cyan-600 text-white"
                        : "border border-slate-700 bg-slate-800 text-slate-100"
                    }`}
                  >
                    {!isUser && (
                      <div className="mb-2 text-xs font-bold uppercase tracking-wide text-cyan-400">
                        SONET AI
                      </div>
                    )}

                    <div className="whitespace-pre-wrap text-sm leading-7">
                      {message.content}
                    </div>
                  </div>
                </div>
              );
            })}

            {loading && (
              <div className="flex justify-start">
                <div className="rounded-2xl border border-slate-700 bg-slate-800 px-4 py-3">
                  <div className="flex items-center gap-2 text-sm text-slate-400">
                    <span>
                      SONET AI is thinking
                    </span>

                    <span className="flex gap-1">
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-cyan-400" />

                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-cyan-400 [animation-delay:150ms]" />

                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-cyan-400 [animation-delay:300ms]" />
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-slate-800 bg-slate-950/70 p-4 sm:p-6">
            <form
              onSubmit={handleSubmit}
              className="flex flex-col gap-3 sm:flex-row"
            >
              <input
                type="text"
                value={input}
                onChange={(event) =>
                  setInput(event.target.value)
                }
                placeholder="Ask SONET AI anything..."
                disabled={loading}
                autoComplete="off"
                className="min-w-0 flex-1 rounded-2xl border border-slate-700 bg-slate-900 px-5 py-4 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-500 disabled:cursor-not-allowed disabled:opacity-60"
              />

              <button
                type="submit"
                disabled={
                  loading ||
                  !input.trim()
                }
                className="rounded-2xl bg-cyan-600 px-7 py-4 text-sm font-bold text-white transition hover:bg-cyan-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading
                  ? "Thinking..."
                  : "Send"}
              </button>
            </form>

            <p className="mt-3 text-center text-xs text-slate-600">
              SONET AI Assistant can help with
              prompts, content, marketing, business,
              and creative tasks.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}