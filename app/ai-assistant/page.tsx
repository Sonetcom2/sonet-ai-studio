"use client";

import {
  FormEvent,
  useEffect,
  useRef,
  useState,
} from "react";

type Message = {
  id?: string;
  role: "user" | "assistant";
  content: string;
  created_at?: string;
};

type Conversation = {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
};

const INITIAL_MESSAGE: Message = {
  role: "assistant",
  content:
    "👋 Hello! I'm SONET AI Assistant. How can I help you today?",
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

  const [conversations, setConversations] = useState<
    Conversation[]
  >([]);

  const [conversationId, setConversationId] =
    useState<string | null>(null);

  const [input, setInput] = useState("");

  const [selectedFile, setSelectedFile] =
    useState<File | null>(null);

  const [credits, setCredits] = useState<number | null>(
    null
  );

  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] =
    useState(true);
  const [conversationLoading, setConversationLoading] =
    useState(false);

  const [sidebarOpen, setSidebarOpen] =
    useState(false);

  const [error, setError] = useState<string | null>(
    null
  );

  const [deletingId, setDeletingId] =
    useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(
    null
  );

  const fileInputRef =
    useRef<HTMLInputElement | null>(null);

  /*
   * Load user credits
   */
  useEffect(() => {
    async function loadCredits() {
      try {
        const response = await fetch("/api/profile", {
          cache: "no-store",
        });

        if (!response.ok) {
          return;
        }

        const data = await response.json();

        if (
          typeof data?.credits === "number"
        ) {
          setCredits(data.credits);
        } else if (
          typeof data?.profile?.credits === "number"
        ) {
          setCredits(data.profile.credits);
        }
      } catch (err) {
        console.error(
          "Failed to load credits:",
          err
        );
      }
    }

    loadCredits();
  }, []);

  /*
   * Load chat history
   */
  useEffect(() => {
    loadHistory();
  }, []);

  /*
   * Auto-scroll
   */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, loading]);

  async function loadHistory() {
    try {
      setHistoryLoading(true);

      const response = await fetch(
        "/api/ai-assistant/history",
        {
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error ||
            "Unable to load chat history."
        );
      }

      setConversations(
        Array.isArray(data?.conversations)
          ? data.conversations
          : []
      );
    } catch (err) {
      console.error(
        "Load history error:",
        err
      );
    } finally {
      setHistoryLoading(false);
    }
  }

  /*
   * Load one conversation
   */
  async function loadConversation(
    id: string
  ) {
    if (loading || conversationLoading) {
      return;
    }

    try {
      setConversationLoading(true);
      setError(null);

      const response = await fetch(
        `/api/ai-assistant/history?conversationId=${encodeURIComponent(
          id
        )}`,
        {
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error ||
            "Unable to load conversation."
        );
      }

      setConversationId(id);

      const loadedMessages: Message[] =
        Array.isArray(data?.messages)
          ? data.messages.map(
              (message: Message) => ({
                id: message.id,
                role: message.role,
                content: message.content,
                created_at:
                  message.created_at,
              })
            )
          : [];

      setMessages(
        loadedMessages.length > 0
          ? loadedMessages
          : [INITIAL_MESSAGE]
      );

      setSelectedFile(null);
      setInput("");
      setSidebarOpen(false);
    } catch (err) {
      console.error(
        "Load conversation error:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load conversation."
      );
    } finally {
      setConversationLoading(false);
    }
  }

  /*
   * Create a new chat
   */
  async function createNewChat() {
    if (loading || conversationLoading) {
      return;
    }

    try {
      setError(null);

      const response = await fetch(
        "/api/ai-assistant/history",
        {
          method: "POST",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error ||
            "Unable to create a new chat."
        );
      }

      const newConversation =
        data?.conversation as Conversation | undefined;

      if (newConversation) {
        setConversations((current) => [
          newConversation,
          ...current.filter(
            (item) =>
              item.id !== newConversation.id
          ),
        ]);

        setConversationId(
          newConversation.id
        );
      } else {
        setConversationId(null);
      }

      setMessages([INITIAL_MESSAGE]);
      setInput("");
      setSelectedFile(null);
      setSidebarOpen(false);
    } catch (err) {
      console.error(
        "Create new chat error:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to create a new chat."
      );
    }
  }

  /*
   * Delete conversation
   */
  async function deleteConversation(
    id: string
  ) {
    if (loading || deletingId) {
      return;
    }

    const confirmed = window.confirm(
      "Delete this conversation? This cannot be undone."
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(id);
      setError(null);

      const response = await fetch(
        `/api/ai-assistant/history?conversationId=${encodeURIComponent(
          id
        )}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error ||
            "Unable to delete conversation."
        );
      }

      setConversations((current) =>
        current.filter(
          (conversation) =>
            conversation.id !== id
        )
      );

      if (conversationId === id) {
        setConversationId(null);
        setMessages([INITIAL_MESSAGE]);
        setInput("");
        setSelectedFile(null);
      }
    } catch (err) {
      console.error(
        "Delete conversation error:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to delete conversation."
      );
    } finally {
      setDeletingId(null);
    }
  }

  /*
   * File validation
   */
  function validateFile(
    file: File
  ): string | null {
    if (file.size > MAX_FILE_SIZE) {
      return "File is too large. Maximum file size is 10MB.";
    }

    if (
      !ALLOWED_FILE_TYPES.includes(
        file.type
      )
    ) {
      return "This file type is not supported.";
    }

    return null;
  }

  /*
   * Select file
   */
  function handleFileChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    const validationError =
      validateFile(file);

    if (validationError) {
      setError(validationError);
      event.target.value = "";
      return;
    }

    setError(null);
    setSelectedFile(file);
  }

  /*
   * Remove selected file
   */
  function removeFile() {
    setSelectedFile(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  /*
   * Send message
   */
  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (
      loading ||
      !input.trim()
    ) {
      return;
    }

    if (
      credits !== null &&
      selectedFile !== null &&
      credits < 1
    ) {
      setError(
        "You do not have enough credits to analyze this file."
      );
      return;
    }

    const userMessage = input.trim();

    setError(null);
    setInput("");
    setLoading(true);

    const optimisticMessage: Message = {
      role: "user",
      content: selectedFile
        ? `${userMessage}\n\n📎 ${selectedFile.name}`
        : userMessage,
    };

    setMessages((current) => [
      ...current,
      optimisticMessage,
    ]);

    try {
      const formData = new FormData();

      formData.append(
        "message",
        userMessage
      );

      if (conversationId) {
        formData.append(
          "conversationId",
          conversationId
        );
      }

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

      if (!response.ok) {
        throw new Error(
          data?.error ||
            "Something went wrong while generating a response."
        );
      }

      if (data?.conversationId) {
        setConversationId(
          data.conversationId
        );
      }

      if (
        typeof data?.creditsRemaining ===
        "number"
      ) {
        setCredits(
          data.creditsRemaining
        );
      }

      if (data?.answer) {
        setMessages((current) => [
          ...current,
          {
            role: "assistant",
            content: data.answer,
          },
        ]);
      }

      setSelectedFile(null);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      await loadHistory();
    } catch (err) {
      console.error(
        "AI Assistant error:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to generate a response."
      );

      /*
       * Remove optimistic user message
       * when request fails.
       */
      setMessages((current) => {
        if (
          current.length > 1 &&
          current[current.length - 1]
            ?.role === "user"
        ) {
          return current.slice(
            0,
            -1
          );
        }

        return current;
      });
    } finally {
      setLoading(false);
    }
  }

  /*
   * STRICT BOOLEAN
   *
   * This is the TypeScript fix for:
   * boolean | null
   */
  const cannotSend = Boolean(
    loading ||
      !input.trim() ||
      (credits !== null &&
        selectedFile !== null &&
        credits < 1)
  );

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="flex min-h-screen">
        {/* Mobile overlay */}
        {sidebarOpen && (
          <button
            type="button"
            aria-label="Close sidebar"
            onClick={() =>
              setSidebarOpen(false)
            }
            className="fixed inset-0 z-30 bg-black/60 lg:hidden"
          />
        )}

        {/* Sidebar */}
        <aside
          className={`fixed inset-y-0 left-0 z-40 flex w-[300px] flex-col border-r border-white/10 bg-slate-950/95 backdrop-blur-xl transition-transform duration-300 lg:static lg:z-auto lg:translate-x-0 ${
            sidebarOpen
              ? "translate-x-0"
              : "-translate-x-full"
          }`}
        >
          {/* Sidebar header */}
          <div className="flex items-center justify-between border-b border-white/10 px-5 py-5">
            <div>
              <div className="text-lg font-black tracking-tight">
                SONET AI
              </div>
              <div className="text-xs font-medium text-slate-400">
                Assistant
              </div>
            </div>

            <button
              type="button"
              onClick={() =>
                setSidebarOpen(false)
              }
              className="rounded-xl p-2 text-slate-400 hover:bg-white/10 hover:text-white lg:hidden"
            >
              ✕
            </button>
          </div>

          {/* New Chat */}
          <div className="p-4">
            <button
              type="button"
              onClick={createNewChat}
              disabled={
                loading ||
                conversationLoading
              }
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-cyan-500 px-4 py-3.5 text-sm font-bold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <span className="text-lg">
                +
              </span>
              New Chat
            </button>
          </div>

          {/* History title */}
          <div className="px-5 pb-3">
            <div className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
              Chat History
            </div>
          </div>

          {/* Conversations */}
          <div className="flex-1 overflow-y-auto px-3 pb-5">
            {historyLoading ? (
              <div className="space-y-2">
                {[1, 2, 3, 4].map(
                  (item) => (
                    <div
                      key={item}
                      className="h-12 animate-pulse rounded-xl bg-white/5"
                    />
                  )
                )}
              </div>
            ) : conversations.length ===
              0 ? (
              <div className="px-3 py-10 text-center">
                <div className="mb-3 text-3xl">
                  💬
                </div>

                <p className="text-sm font-semibold text-slate-400">
                  No conversations yet
                </p>

                <p className="mt-1 text-xs text-slate-600">
                  Start a new chat to begin.
                </p>
              </div>
            ) : (
              <div className="space-y-1.5">
                {conversations.map(
                  (conversation) => {
                    const active =
                      conversation.id ===
                      conversationId;

                    return (
                      <div
                        key={
                          conversation.id
                        }
                        className={`group flex items-center gap-2 rounded-xl border transition ${
                          active
                            ? "border-cyan-400/20 bg-cyan-400/10"
                            : "border-transparent hover:bg-white/5"
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() =>
                            loadConversation(
                              conversation.id
                            )
                          }
                          disabled={
                            loading ||
                            conversationLoading
                          }
                          className="min-w-0 flex-1 px-3 py-3 text-left disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          <div
                            className={`truncate text-sm font-semibold ${
                              active
                                ? "text-cyan-300"
                                : "text-slate-300"
                            }`}
                          >
                            {conversation.title ||
                              "New Chat"}
                          </div>

                          <div className="mt-1 text-[10px] text-slate-600">
                            {new Date(
                              conversation.updated_at
                            ).toLocaleDateString()}
                          </div>
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            deleteConversation(
                              conversation.id
                            )
                          }
                          disabled={
                            loading ||
                            deletingId ===
                              conversation.id
                          }
                          aria-label="Delete conversation"
                          className="mr-2 rounded-lg p-2 text-slate-600 opacity-0 transition hover:bg-red-500/10 hover:text-red-400 group-hover:opacity-100 disabled:opacity-30"
                        >
                          {deletingId ===
                          conversation.id
                            ? "..."
                            : "🗑️"}
                        </button>
                      </div>
                    );
                  }
                )}
              </div>
            )}
          </div>

          {/* Credits */}
          <div className="border-t border-white/10 p-4">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400">
                  Credits
                </span>

                <span className="font-bold text-cyan-300">
                  {credits === null
                    ? "—"
                    : credits.toLocaleString()}
                </span>
              </div>

              <div className="mt-2 text-[11px] leading-5 text-slate-500">
                File analysis may use credits
                according to your current
                plan settings.
              </div>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <section className="flex min-h-screen min-w-0 flex-1 flex-col">
          {/* Header */}
          <header className="sticky top-0 z-20 border-b border-white/10 bg-slate-950/85 backdrop-blur-xl">
            <div className="flex items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() =>
                    setSidebarOpen(true)
                  }
                  className="rounded-xl border border-white/10 bg-white/5 p-2.5 text-slate-300 hover:bg-white/10 lg:hidden"
                  aria-label="Open chat history"
                >
                  ☰
                </button>

                <div>
                  <h1 className="text-lg font-black tracking-tight sm:text-xl">
                    SONET AI Assistant
                  </h1>

                  <p className="hidden text-xs text-slate-500 sm:block">
                    Your intelligent creative
                    assistant
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1.5 text-xs font-bold text-cyan-300">
                  {credits === null
                    ? "Credits: —"
                    : `Credits: ${credits.toLocaleString()}`}
                </div>
              </div>
            </div>
          </header>

          {/* Chat */}
          <div className="flex-1 overflow-y-auto">
            <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
              {/* Conversation loading */}
              {conversationLoading && (
                <div className="mb-5 flex justify-center">
                  <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-slate-400">
                    Loading conversation...
                  </div>
                </div>
              )}

              {/* Messages */}
              <div className="space-y-6">
                {messages.map(
                  (message, index) => {
                    const isUser =
                      message.role ===
                      "user";

                    return (
                      <div
                        key={
                          message.id ||
                          `${message.role}-${index}`
                        }
                        className={`flex ${
                          isUser
                            ? "justify-end"
                            : "justify-start"
                        }`}
                      >
                        <div
                          className={`flex max-w-[92%] items-start gap-3 sm:max-w-[82%] ${
                            isUser
                              ? "flex-row-reverse"
                              : ""
                          }`}
                        >
                          {/* Avatar */}
                          <div
                            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm font-black ${
                              isUser
                                ? "bg-cyan-500 text-slate-950"
                                : "border border-white/10 bg-white/5 text-cyan-300"
                            }`}
                          >
                            {isUser
                              ? "U"
                              : "S"}
                          </div>

                          {/* Bubble */}
                          <div
                            className={`rounded-2xl px-4 py-3.5 shadow-xl ${
                              isUser
                                ? "rounded-tr-md bg-cyan-500 text-slate-950"
                                : "rounded-tl-md border border-white/10 bg-white/[0.045] text-slate-200"
                            }`}
                          >
                            <div className="whitespace-pre-wrap break-words text-sm leading-7">
                              {
                                message.content
                              }
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  }
                )}

                {/* Loading response */}
                {loading && (
                  <div className="flex justify-start">
                    <div className="flex items-start gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-sm font-black text-cyan-300">
                        S
                      </div>

                      <div className="rounded-2xl rounded-tl-md border border-white/10 bg-white/[0.045] px-5 py-4">
                        <div className="flex items-center gap-1.5">
                          <span className="h-2 w-2 animate-bounce rounded-full bg-cyan-300" />
                          <span className="h-2 w-2 animate-bounce rounded-full bg-cyan-300 [animation-delay:120ms]" />
                          <span className="h-2 w-2 animate-bounce rounded-full bg-cyan-300 [animation-delay:240ms]" />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="px-4 pb-3 sm:px-6 lg:px-8">
              <div className="mx-auto flex max-w-5xl items-start justify-between gap-4 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                <span>
                  {error}
                </span>

                <button
                  type="button"
                  onClick={() =>
                    setError(null)
                  }
                  className="shrink-0 text-red-300 hover:text-white"
                >
                  ✕
                </button>
              </div>
            </div>
          )}

          {/* Selected file */}
          {selectedFile && (
            <div className="px-4 pb-3 sm:px-6 lg:px-8">
              <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 rounded-2xl border border-cyan-400/20 bg-cyan-400/5 px-4 py-3">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-cyan-400/10">
                    📎
                  </div>

                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold text-slate-200">
                      {selectedFile.name}
                    </div>

                    <div className="text-xs text-slate-500">
                      {(
                        selectedFile.size /
                        1024 /
                        1024
                      ).toFixed(2)}{" "}
                      MB
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={removeFile}
                  className="rounded-xl px-3 py-2 text-xs font-bold text-slate-400 hover:bg-white/10 hover:text-white"
                >
                  Remove
                </button>
              </div>
            </div>
          )}

          {/* Composer */}
          <div className="border-t border-white/10 bg-slate-950/95 px-4 py-4 sm:px-6 lg:px-8">
            <form
              onSubmit={handleSubmit}
              className="mx-auto max-w-5xl"
            >
              <div className="rounded-3xl border border-white/10 bg-white/[0.035] p-2 shadow-2xl shadow-black/20 focus-within:border-cyan-400/30">
                <div className="flex items-end gap-2">
                  {/* File upload */}
                  <button
                    type="button"
                    onClick={() =>
                      fileInputRef.current?.click()
                    }
                    disabled={loading}
                    aria-label="Attach file"
                    className="mb-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-xl text-slate-400 transition hover:bg-white/10 hover:text-cyan-300 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    📎
                  </button>

                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    accept={[
                      ".png",
                      ".jpg",
                      ".jpeg",
                      ".webp",
                      ".pdf",
                      ".txt",
                      ".csv",
                      ".json",
                      ".doc",
                      ".docx",
                      ".xls",
                      ".xlsx",
                      ".ppt",
                      ".pptx",
                    ].join(",")}
                    onChange={
                      handleFileChange
                    }
                  />

                  {/* Textarea */}
                  <textarea
                    value={input}
                    onChange={(event) =>
                      setInput(
                        event.target.value
                      )
                    }
                    onKeyDown={(event) => {
                      if (
                        event.key ===
                          "Enter" &&
                        !event.shiftKey
                      ) {
                        event.preventDefault();

                        if (
                          !cannotSend
                        ) {
                          event.currentTarget.form?.requestSubmit();
                        }
                      }
                    }}
                    disabled={loading}
                    rows={1}
                    placeholder="Message SONET AI Assistant..."
                    className="max-h-40 min-h-[44px] flex-1 resize-none bg-transparent px-2 py-3 text-sm leading-6 text-white outline-none placeholder:text-slate-600 disabled:cursor-not-allowed"
                  />

                  {/* Send */}
                  <button
                    type="submit"
                    disabled={
                      cannotSend
                    }
                    className="mb-1 flex h-11 shrink-0 items-center justify-center rounded-2xl bg-cyan-500 px-5 text-sm font-bold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-950/30 border-t-slate-950" />
                        <span className="hidden sm:inline">
                          Thinking
                        </span>
                      </span>
                    ) : (
                      <>
                        <span className="hidden sm:inline">
                          Send
                        </span>
                        <span className="sm:hidden">
                          ↑
                        </span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="mt-2 px-2 text-center text-[10px] leading-5 text-slate-600">
                SONET AI can make mistakes.
                Check important information
                before relying on it.
              </div>
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}