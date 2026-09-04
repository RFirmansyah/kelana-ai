"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import {
  createConversation,
  sendMessage,
  type ConversationOut,
} from "@/services/kbService";

type ChatMode = "rag" | "llm";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  createdAt: string;
  isError?: boolean;
}

const SUGGESTIONS = [
  "What should I pack for a tropical destination?",
  "What documents do I need before international travel?",
  "Any tips for traveling on a tight budget?",
];

function newId() {
  return Math.random().toString(36).slice(2);
}

interface ChatPanelProps {
  heightClass?: string;
  initialConversation?: ConversationOut | null;
  onConversationCreated?: (conv: ConversationOut) => void;
  onMessageSent?: (conversationId: number, userText: string, assistantText: string) => void;
}

export function ChatPanel({
  heightClass = "h-[520px]",
  initialConversation,
  onConversationCreated,
  onMessageSent,
}: ChatPanelProps) {
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [mode, setMode] = useState<ChatMode>("rag");
  const [conversationId, setConversationId] = useState<number | null>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Restore history when a conversation is selected from the sidebar
  useEffect(() => {
    if (initialConversation) {
      setConversationId(initialConversation.id);
      setMessages(
        initialConversation.messages.map((m) => ({
          id: String(m.id),
          role: m.role,
          text: m.content,
          createdAt: m.created_at ?? new Date().toISOString(),
        }))
      );
    } else {
      setConversationId(null);
      setMessages([]);
    }
    setInput("");
  }, [initialConversation?.id]);

  // Keep the latest message visible both when opening/restoring a conversation
  // and whenever a new message/typing indicator is appended.
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      bottomRef.current?.scrollIntoView({
        behavior: messages.length > 0 && !initialConversation ? "smooth" : "auto",
        block: "end",
      });
    });
    return () => cancelAnimationFrame(frame);
  }, [initialConversation?.id, messages.length, sending]);

  async function getOrCreateConversation(token: string): Promise<number> {
    if (conversationId !== null) return conversationId;
    const conv = await createConversation(token);
    setConversationId(conv.id);
    onConversationCreated?.(conv);
    return conv.id;
  }

  async function handleSend(question?: string) {
    const text = (question ?? input).trim();
    if (!text || sending) return;

    const token = localStorage.getItem("access_token");
    if (!token) { router.push("/login"); return; }

    setMessages((prev) => [
      ...prev,
      { id: newId(), role: "user", text, createdAt: new Date().toISOString() },
    ]);
    setInput("");
    setSending(true);

    try {
      const convId = await getOrCreateConversation(token);
      const reply = await sendMessage(token, convId, text, mode);
      setMessages((prev) => [
        ...prev,
        { id: String(reply.id), role: "assistant", text: reply.content, createdAt: reply.created_at ?? new Date().toISOString() },
      ]);
      onMessageSent?.(convId, text, reply.content);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: newId(),
          role: "assistant",
          text: err instanceof Error ? err.message : "Something went wrong.",
          createdAt: new Date().toISOString(),
          isError: true,
        },
      ]);
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  }

  function handleNewChat() {
    setMessages([]);
    setConversationId(null);
    setInput("");
    inputRef.current?.focus();
  }

  const chatTitle = useMemo(() => {
    if (initialConversation?.title?.trim()) return initialConversation.title.trim();
    const firstUserMessage = messages.find((message) => message.role === "user");
    if (firstUserMessage) {
      const title = firstUserMessage.text.replace(/\s+/g, " ").trim();
      return title.length > 80 ? `${title.slice(0, 77)}…` : title;
    }
    return "New conversation";
  }, [initialConversation?.title, messages]);

  return (
    <div className="flex flex-col rounded-3xl border border-gray-200 bg-white shadow-xl shadow-gray-200/60 dark:border-white/8 dark:bg-[#161b22] dark:shadow-black/40 overflow-hidden h-full">

      {/* Toolbar / conversation header */}
      <div className="shrink-0 px-4 py-2.5 border-b border-gray-100 dark:border-white/8">
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">Conversation</p>
            <h2 className="truncate text-sm font-bold text-gray-800 dark:text-gray-100" title={chatTitle}>
              {chatTitle}
            </h2>
          </div>
          <div className="inline-flex shrink-0 items-center gap-1 rounded-xl border border-gray-200 bg-gray-50 dark:border-white/10 dark:bg-white/5 p-0.5">
          {(["rag", "llm"] as ChatMode[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={`rounded-lg px-3 py-1 text-xs font-semibold transition-colors cursor-pointer ${
                mode === m
                  ? m === "rag" ? "bg-sky-500 text-white shadow-sm" : "bg-violet-500 text-white shadow-sm"
                  : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
              }`}
            >
              {m === "rag" ? "📚 RAG" : "🤖 LLM"}
            </button>
          ))}
          </div>
          <span className="text-[10px] text-gray-400 dark:text-gray-500 hidden lg:block">
          {mode === "rag" ? "Grounded in knowledge base" : "Free-form AI assistant"}
        </span>
          <button
            type="button"
            onClick={handleNewChat}
            className="shrink-0 text-xs text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors cursor-pointer px-2 py-1 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5"
          >
            + New
          </button>
        </div>
      </div>

      {/* Messages */}
      <div ref={messagesContainerRef} className="flex-1 overflow-y-auto px-4 py-5 min-h-0">
        <div className="flex flex-col gap-5">
          {messages.length === 0 && (
            <div className="flex flex-col items-center text-center gap-4 py-6">
              <div className="text-4xl">{mode === "rag" ? "📚" : "🤖"}</div>
              <div>
                <h3 className="text-base font-bold bg-gradient-to-r from-sky-500 to-violet-500 dark:from-sky-400 dark:to-violet-400 bg-clip-text text-transparent">
                  {mode === "rag" ? "Ask KelanaAI (Knowledge Base)" : "Chat with KelanaAI"}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-xs mx-auto">
                  {mode === "rag"
                    ? "I'll answer using documents in the KelanaAI knowledge base."
                    : "I'm your AI travel assistant. Ask me anything!"}
                </p>
              </div>
              <div className="flex flex-col gap-2 w-full">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => handleSend(s)}
                    className="text-xs text-left text-sky-600 dark:text-sky-400 border border-sky-300 dark:border-sky-500/30 hover:border-sky-500 dark:hover:border-sky-400 hover:bg-sky-50 dark:hover:bg-sky-500/10 rounded-xl px-3 py-2 transition-colors cursor-pointer"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((m) => <ChatBubble key={m.id} message={m} />)}
          {sending && <TypingBubble />}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Composer */}
      <div className="shrink-0 border-t border-gray-100 dark:border-white/8 px-4 py-3">
        <div className="flex items-end gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={mode === "rag" ? "Ask about destinations, packing…" : "Chat with your AI travel assistant…"}
            rows={1}
            disabled={sending}
            className="flex-1 resize-none max-h-28 rounded-2xl border border-gray-200 bg-gray-50 dark:border-white/10 dark:bg-white/5 px-4 py-2.5 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 outline-none focus:ring-2 focus:ring-sky-400 disabled:opacity-60"
          />
          <button
            type="button"
            onClick={() => handleSend()}
            disabled={sending || !input.trim()}
            aria-label="Send"
            className={`shrink-0 flex items-center justify-center w-10 h-10 rounded-2xl disabled:opacity-40 disabled:cursor-not-allowed text-white transition-colors cursor-pointer ${
              mode === "rag" ? "bg-sky-500 hover:bg-sky-600" : "bg-violet-500 hover:bg-violet-600"
            }`}
          >
            <SendIcon />
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Bubbles ────────────────────────────────────────────────────────────────────

function formatMessageTime(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function ChatBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";
  const timestamp = formatMessageTime(message.createdAt);

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="max-w-[80%] flex flex-col items-end gap-1">
          <div className="rounded-2xl rounded-br-md bg-sky-500 px-4 py-2.5 text-sm text-white leading-relaxed">
            {message.text}
          </div>
          {timestamp && (
            <span className="px-1 text-[10px] text-gray-400 dark:text-gray-500">{timestamp}</span>
          )}
        </div>
      </div>
    );
  }

  if (message.isError) {
    return (
      <div className="flex justify-start">
        <div className="max-w-[85%] flex flex-col items-start gap-1">
          <div className="rounded-2xl rounded-bl-md border border-red-200 bg-red-50 dark:border-red-500/30 dark:bg-red-500/10 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 leading-relaxed">
            {message.text}
          </div>
          {timestamp && (
            <span className="px-1 text-[10px] text-gray-400 dark:text-gray-500">{timestamp}</span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start">
      <div className="max-w-[85%] flex flex-col items-start gap-1">
        <div className="rounded-2xl rounded-bl-md border border-gray-200 bg-gray-50 dark:border-white/10 dark:bg-white/5 px-4 py-3">
          <div className="chat-md text-sm text-gray-800 dark:text-gray-100">
            <ReactMarkdown>{message.text}</ReactMarkdown>
          </div>
        </div>
        {timestamp && (
          <span className="px-1 text-[10px] text-gray-400 dark:text-gray-500">{timestamp}</span>
        )}
      </div>
    </div>
  );
}

function TypingBubble() {
  return (
    <div className="flex justify-start" aria-live="polite" aria-label="KelanaAI is typing">
      <div className="rounded-2xl rounded-bl-md border border-gray-200 bg-gray-50 dark:border-white/10 dark:bg-white/5 px-4 py-2.5 flex items-center gap-2">
        <span className="text-[11px] text-gray-500 dark:text-gray-400">KelanaAI is thinking</span>
        <span className="flex items-center gap-1" aria-hidden="true">
          <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce [animation-delay:-0.3s]" />
          <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce [animation-delay:-0.15s]" />
          <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" />
        </span>
      </div>
    </div>
  );
}

function SendIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5" aria-hidden="true">
      <path d="M3.478 2.404a.75.75 0 00-.926.941l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.404z" />
    </svg>
  );
}

