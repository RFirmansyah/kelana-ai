"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { askQuestion, getSourceLabel, type AskSource } from "@/services/kbService";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  sources?: AskSource[];
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
  /** Tailwind height class for the scrollable message area. */
  heightClass?: string;
}

export function ChatPanel({ heightClass = "h-[520px]" }: ChatPanelProps) {
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, sending]);

  async function handleSend(question?: string) {
    const text = (question ?? input).trim();
    if (!text || sending) return;

    const token = localStorage.getItem("access_token");
    if (!token) {
      router.push("/login");
      return;
    }

    setMessages((prev) => [...prev, { id: newId(), role: "user", text }]);
    setInput("");
    setSending(true);

    try {
      const res = await askQuestion(token, text);
      setMessages((prev) => [
        ...prev,
        {
          id: newId(),
          role: "assistant",
          text: res.answer.answer || "I couldn't find anything relevant to that in the knowledge base.",
          sources: res.answer.source,
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: newId(),
          role: "assistant",
          text: err instanceof Error ? err.message : "Something went wrong. Please try again.",
          isError: true,
        },
      ]);
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div className="flex flex-col rounded-3xl border border-gray-200 bg-white shadow-xl shadow-gray-200/60 dark:border-white/8 dark:bg-[#161b22] dark:shadow-black/40 overflow-hidden">
      {/* Messages */}
      <div className={`${heightClass} overflow-y-auto px-5 py-5`}>
        <div className="flex flex-col gap-4">
          {messages.length === 0 && (
            <div className="flex flex-col items-center text-center gap-4 py-6">
              <div className="text-4xl">🧭</div>
              <div>
                <h3 className="text-base font-bold bg-gradient-to-r from-sky-500 to-violet-500 dark:from-sky-400 dark:to-violet-400 bg-clip-text text-transparent">
                  Ask KelanaAI Assistant
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-xs mx-auto">
                  Ask a travel question and I&apos;ll answer using the KelanaAI knowledge base.
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

          {messages.map((m) => (
            <ChatBubble key={m.id} message={m} />
          ))}

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
            placeholder="Ask about destinations, packing, budgeting…"
            rows={1}
            disabled={sending}
            className="flex-1 resize-none max-h-28 rounded-2xl border border-gray-200 bg-gray-50 dark:border-white/10 dark:bg-white/5 px-4 py-2.5 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 outline-none focus:ring-2 focus:ring-sky-400 disabled:opacity-60"
          />
          <button
            type="button"
            onClick={() => handleSend()}
            disabled={sending || !input.trim()}
            aria-label="Send message"
            className="shrink-0 flex items-center justify-center w-10 h-10 rounded-2xl bg-sky-500 hover:bg-sky-600 disabled:opacity-40 disabled:cursor-not-allowed text-white transition-colors cursor-pointer"
          >
            <SendIcon />
          </button>
        </div>
      </div>
    </div>
  );
}

function ChatBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
          isUser
            ? "bg-sky-500 text-white rounded-br-md"
            : message.isError
            ? "bg-red-50 text-red-600 border border-red-200 dark:bg-red-500/10 dark:border-red-500/30 dark:text-red-400 rounded-bl-md"
            : "bg-gray-50 text-gray-800 border border-gray-200 dark:bg-white/5 dark:border-white/10 dark:text-gray-100 rounded-bl-md"
        }`}
      >
        {message.text}

        {message.sources && message.sources.length > 0 && (
          <div className="mt-3 pt-2 border-t border-gray-100 dark:border-white/10 flex flex-col gap-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
              Sources
            </span>
            {message.sources.map((s, i) => (
              <span key={i} className="text-xs text-sky-600 dark:text-sky-400 truncate">
                📄 {getSourceLabel(s)}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function TypingBubble() {
  return (
    <div className="flex justify-start">
      <div className="bg-gray-50 border border-gray-200 dark:bg-white/5 dark:border-white/10 rounded-2xl rounded-bl-md px-4 py-2.5 flex items-center gap-1">
        <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce [animation-delay:-0.3s]" />
        <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce [animation-delay:-0.15s]" />
        <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" />
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
