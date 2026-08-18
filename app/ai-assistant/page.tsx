
"use client";

import {
  FormEvent,
  useEffect,
  useRef,
  useState,
} from "react";

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

const MAX_FILE_SIZE = 10 * 1024 * 1024;

const ALLOWED_FILE_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "application/pdf",
  "text/plain",
  "text/csv",
  "application/json",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
];

export default function AIAssistantPage() {
  const [messages, setMessages] = useState<Message[]>([
    INITIAL_MESSAGE,
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const [selectedFile, setSelectedFile] =
    useState<File | null>(null);

  const [credits, setCredits] = useState<number | null>(
    null
  );

  const [creditsLoading, setCreditsLoading] =
    useState(true);

  const [fileError, setFileError] = useState("");

  const fileInputRef =
    useRef<HTMLInputElement | null>(null);

  const messagesEndRef =
    useRef<HTMLDivElement | null>(null);

  // ==========================================
  // LOAD USER CREDITS
  // ==========================================

  useEffect(() => {
    async function loadCredits() {
      try {
        const response = await fetch(
          "/api/profile",
          {
            method: "GET",
            cache: "no-store",
          }
        );

        const data = await response.json();

        if (response.ok && data) {
          const userCredits = Number(
            data.credits ??
              data.profile?.credits ??
              0
          );

          if (Number.isFinite(userCredits)) {
            setCredits(userCredits);
          }
        }
      } catch (error) {
        console.error(
          "Unable to load credits:",
          error
        );
      } finally {
        setCreditsLoading(false);
      }
    }

    loadCredits();
  }, []);

  // ==========================================
  // AUTO SCROLL
  // ==========================================

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, loading]);

  // ==========================================
  // FILE SELECTION
  // ==========================================

  function handleFileChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    setFileError("");

    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (file.size === 0) {
      setFileError(
        "The selected file is empty."
      );

      event.target.value = "";
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setFileError(
        "File is too large. Maximum size is 10 MB."
      );

      event.target.value = "";
      return;
    }

    if (
      file.type &&
      !ALLOWED_FILE_TYPES.includes(file.type)
    ) {
      setFileError(
        "This file type is not supported."
      );

      event.target.value = "";
      return;
    }

    setSelectedFile(file);
  }

  function removeFile() {
    setSelectedFile(null);
    setFileError("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  // ==========================================
  // SEND MESSAGE
  // ==========================================

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const message = input.trim();

    if (!message || loading) {
      return;
    }

    if (
      credits !== null &&
      credits < 1
    ) {
      const errorMessage: Message = {
        id: Date.now(),
        role: "assistant",
        content:
          "You don't have enough credits to use SONET AI Assistant. Please purchase more credits or upgrade your plan.",
      };

      setMessages((current) => [
        ...current,
        errorMessage,
      ]);

      return;
    }

    const userContent = selectedFile
      ? `${message}\n\n📎 ${selectedFile.name}`
      : message;

    const userMessage: Message = {
      id: Date.now(),
      role: "user",
      content: userContent,
    };

    setMessages((current) => [
      ...current,
      userMessage,
    ]);

    setInput("");
    setLoading(true);
    setFileError("");

    try {
      const formData = new FormData();

      formData.append("message", message);

      if (selectedFile) {
        formData.append(
          "file",
          selectedFile
        );
      }

      const response = await fetch(
        "/api/ai-assistant",
        {
          method: "POST",
          body: formData,
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

      if (
        typeof data.creditsRemaining ===
        "number"
      ) {
        setCredits(
          data.creditsRemaining
        );
      }

      removeFile();
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

  // ==========================================
  // CLEAR CHAT
  // ==========================================

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
    removeFile();
  }

  const cannotSend =
    loading ||
    !input.trim() ||
    (credits !== null && credits < 1);

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 py-6 sm:px-6 lg:px-8">

        {/* ======================================
            HEADER
        ====================================== */}

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

          <div className="flex items-center gap-3">

            {/* CREDIT DISPLAY */}

            <div className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-2 text-sm">
              <span className="text-slate-400">
                Credits:
              </span>{" "}

              <span className="font-bold text-cyan-400">
                {creditsLoading
                  ? "..."
                  : credits ?? 0}
              </span>
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
        </div>

        {/* ======================================
            CHAT
        ====================================== */}

        <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-3xl border border-slate-800 bg-slate-900 shadow-2xl">

          {/* MESSAGES */}

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

            {/* LOADING */}

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

          {/* ======================================
              INPUT AREA
          ====================================== */}

          <div className="border-t border-slate-800 bg-slate-950/70 p-4 sm:p-6">

            {/* FILE ERROR */}

            {fileError && (
              <div className="mb-3 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                {fileError}
              </div>
            )}

            {/* SELECTED FILE */}

            {selectedFile && (
              <div className="mb-3 flex items-center justify-between rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-4 py-3">

                <div className="flex min-w-0 items-center gap-3">
                  <span className="text-xl">
                    📎
                  </span>

                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-white">
                      {selectedFile.name}
                    </p>

                    <p className="text-xs text-slate-400">
                      {(
                        selectedFile.size /
                        1024 /
                        1024
                      ).toFixed(2)}{" "}
                      MB
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={removeFile}
                  disabled={loading}
                  className="ml-3 rounded-lg px-2 py-1 text-sm text-slate-400 transition hover:bg-slate-800 hover:text-white"
                >
                  ✕
                </button>
              </div>
            )}

            {/* FORM */}

            <form
              onSubmit={handleSubmit}
              className="flex flex-col gap-3"
            >

              <div className="flex flex-col gap-3 sm:flex-row">

                {/* UPLOAD */}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept={ALLOWED_FILE_TYPES.join(",")}
                  onChange={handleFileChange}
                  disabled={loading}
                  className="hidden"
                />

                <button
                  type="button"
                  onClick={() =>
                    fileInputRef.current?.click()
                  }
                  disabled={loading}
                  title="Upload file"
                  className="rounded-2xl border border-slate-700 bg-slate-900 px-5 py-4 text-sm font-semibold text-slate-300 transition hover:border-cyan-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  📎 Upload
                </button>

                {/* MESSAGE */}

                <input
                  type="text"
                  value={input}
                  onChange={(event) =>
                    setInput(
                      event.target.value
                    )
                  }
                  placeholder="Ask SONET AI anything..."
                  disabled={loading}
                  autoComplete="off"
                  className="min-w-0 flex-1 rounded-2xl border border-slate-700 bg-slate-900 px-5 py-4 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-500 disabled:cursor-not-allowed disabled:opacity-60"
                />

                {/* SEND */}

                <button
                  type="submit"
                  disabled={cannotSend}
                  className="rounded-2xl bg-cyan-600 px-7 py-4 text-sm font-bold text-white transition hover:bg-cyan-500 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading
                    ? "Thinking..."
                    : "Send"}
                </button>
              </div>

            </form>

            {/* CREDIT NOTICE */}

            <p className="mt-3 text-center text-xs text-slate-500">
              Each Assistant request uses{" "}
              <span className="font-semibold text-cyan-400">
                1 credit
              </span>
              . Upload an image or supported document
              for SONET AI to analyze.
            </p>

            {credits !== null &&
              credits < 1 && (
                <p className="mt-2 text-center text-xs font-semibold text-red-400">
                  You need at least 1 credit to use
                  SONET AI Assistant.
                </p>
              )}
          </div>
        </div>
      </div>
    </main>
  );
}