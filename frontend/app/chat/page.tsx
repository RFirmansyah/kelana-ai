"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";
import { UserMenu } from "@/components/UserMenu";
import { ChatPanel } from "@/components/ChatPanel";
import {
  listConversations,
  deleteConversation,
  conversationTitle,
  relativeDate,
  type ConversationOut,
} from "@/services/kbService";

export default function ChatPage() {
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [conversations, setConversations] = useState<ConversationOut[]>([]);
  const [activeConv, setActiveConv] = useState<ConversationOut | null>(null);
  const [loadingList, setLoadingList] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const fetchList = useCallback(async (token: string) => {
    try {
      const list = await listConversations(token);
      setConversations(list);
    } catch {
      // non-fatal
    } finally {
      setLoadingList(false);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) { router.replace("/login"); return; }
    setCheckingAuth(false);
    fetchList(token);
  }, [router, fetchList]);

  function handleConversationCreated(conv: ConversationOut) {
    setConversations((prev) => [conv, ...prev]);
    setActiveConv(conv);
  }

  function handleSelect(conv: ConversationOut) {
    setActiveConv(conv);
    if (window.innerWidth < 768) setSidebarOpen(false);
  }

  function handleNewChat() {
    setActiveConv(null);
  }

  // Keep the sidebar entry in sync as new messages arrive
  function handleMessageSent(convId: number, userText: string, assistantText: string) {
    const now = new Date().toISOString();
    setConversations((prev) => {
      const updated = prev.map((c) => {
        if (c.id !== convId) return c;
        const base = Date.now();
        return {
          ...c,
          title: c.title || userText.slice(0, 120),
          updated_at: now,
          messages: [
            ...c.messages,
            { id: base, role: "user" as const, content: userText, created_at: now },
            { id: base + 1, role: "assistant" as const, content: assistantText, created_at: now },
          ],
        };
      });
      return updated.sort((a, b) =>
        new Date(b.updated_at || b.created_at || 0).getTime() -
        new Date(a.updated_at || a.created_at || 0).getTime()
      );
    });
  }

  async function handleDeleteConversation(conv: ConversationOut) {
    const token = localStorage.getItem("access_token");
    if (!token) { router.replace("/login"); return; }
    if (!window.confirm(`Delete "${conversationTitle(conv)}"?`)) return;
    try {
      await deleteConversation(token, conv.id);
      setConversations((prev) => prev.filter((c) => c.id !== conv.id));
      if (activeConv?.id === conv.id) setActiveConv(null);
    } catch (err) {
      window.alert(err instanceof Error ? err.message : "Failed to delete conversation.");
    }
  }

  if (checkingAuth) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-100 dark:bg-[#0d1117]">
        <div className="w-8 h-8 rounded-full border-4 border-sky-100 border-t-sky-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-100 dark:bg-[#0d1117] text-gray-900 dark:text-gray-100 transition-colors duration-200 flex flex-col overflow-hidden">

      {/* ── Top bar ── */}
      <header className="shrink-0 flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-white/8 bg-white/80 dark:bg-[#0d1117]/80 backdrop-blur-xl z-40">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setSidebarOpen((v) => !v)}
            aria-label="Toggle sidebar"
            className="p-1.5 rounded-lg text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
          >
            <MenuIcon />
          </button>
          <Link
            href="/trips"
            className="text-sm text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors"
          >
            ← My Trips
          </Link>
        </div>
        <span className="text-sm font-bold bg-gradient-to-r from-sky-500 to-violet-500 dark:from-sky-400 dark:to-violet-400 bg-clip-text text-transparent">
          KelanaAI Chat
        </span>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <UserMenu />
        </div>
      </header>

      {/* ── Body ── */}
      <div className="flex flex-1 min-h-0">

        {/* ── Sidebar ── */}
        <aside className={`${
          sidebarOpen ? "w-64 md:w-72" : "w-0"
        } shrink-0 overflow-hidden transition-[width] duration-200 border-r border-gray-200 dark:border-white/8 bg-white dark:bg-[#161b22] flex flex-col`}>

          <div className="p-3 border-b border-gray-100 dark:border-white/8 shrink-0">
            <button
              type="button"
              onClick={handleNewChat}
              className="w-full flex items-center justify-center gap-2 rounded-xl border border-dashed border-gray-300 dark:border-white/15 text-xs font-semibold text-gray-500 dark:text-gray-400 hover:border-sky-400 hover:text-sky-600 dark:hover:border-sky-500 dark:hover:text-sky-400 py-2 transition-colors cursor-pointer"
            >
              <PlusIcon /> New conversation
            </button>
          </div>

          <div className="flex-1 overflow-y-auto py-2 min-h-0">
            {loadingList ? (
              <div className="flex justify-center py-8">
                <div className="w-5 h-5 rounded-full border-2 border-sky-200 border-t-sky-500 animate-spin" />
              </div>
            ) : conversations.length === 0 ? (
              <p className="text-xs text-gray-400 dark:text-gray-500 text-center py-8 px-4">
                No conversations yet. Start chatting!
              </p>
            ) : (
              conversations.map((conv) => {
                const isActive = activeConv?.id === conv.id;
                return (
                  <div
                    key={conv.id}
                    className={`group flex items-center mx-1 rounded-xl transition-colors ${
                      isActive
                        ? "bg-sky-50 dark:bg-sky-500/10"
                        : "hover:bg-gray-50 dark:hover:bg-white/5"
                    }`}
                    style={{ width: "calc(100% - 8px)" }}
                  >
                    <button
                      type="button"
                      onClick={() => handleSelect(conv)}
                      className="min-w-0 flex-1 text-left px-3 py-2.5 cursor-pointer"
                    >
                      <p className={`text-xs font-semibold truncate ${
                        isActive ? "text-sky-700 dark:text-sky-400" : "text-gray-700 dark:text-gray-200"
                      }`}>
                        {conversationTitle(conv)}
                      </p>
                      <div className="flex items-center justify-between mt-0.5">
                        <p className="text-[10px] text-gray-400 dark:text-gray-500">
                          {relativeDate(conv.updated_at || conv.created_at)}
                        </p>
                        <p className="text-[10px] text-gray-400 dark:text-gray-500">
                          {conv.messages.length} msg{conv.messages.length !== 1 ? "s" : ""}
                        </p>
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteConversation(conv)}
                      aria-label={`Delete ${conversationTitle(conv)}`}
                      title="Delete conversation"
                      className="mr-1 shrink-0 rounded-lg p-1.5 text-gray-300 opacity-0 group-hover:opacity-100 hover:bg-red-50 hover:text-red-500 dark:text-gray-600 dark:hover:bg-red-500/10 dark:hover:text-red-400 transition-opacity cursor-pointer"
                    >
                      <TrashIcon />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </aside>

        {/* ── Chat area ── */}
        <main className="flex-1 min-w-0 flex flex-col p-4 md:p-6 min-h-0">
          <ChatPanel
            initialConversation={activeConv}
            onConversationCreated={handleConversationCreated}
            onMessageSent={handleMessageSent}
          />
        </main>
      </div>
    </div>
  );
}

function MenuIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5" aria-hidden="true">
      <path fillRule="evenodd" d="M3 6.75A.75.75 0 013.75 6h16.5a.75.75 0 010 1.5H3.75A.75.75 0 013 6.75zM3 12a.75.75 0 01.75-.75h16.5a.75.75 0 010 1.5H3.75A.75.75 0 013 12zm0 5.25a.75.75 0 01.75-.75H12a.75.75 0 010 1.5H3.75a.75.75 0 01-.75-.75z" clipRule="evenodd" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-3.5 h-3.5" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M9.75 10.5v6m4.5-6v6M8.25 6.75l.6-2.1A1.5 1.5 0 0110.29 3.6h3.42a1.5 1.5 0 011.44 1.05l.6 2.1m-10.5 0 .75 13.5a1.5 1.5 0 001.5 1.5h9a1.5 1.5 0 001.5-1.5l.75-13.5" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5" aria-hidden="true">
      <path fillRule="evenodd" d="M12 3.75a.75.75 0 01.75.75v6.75h6.75a.75.75 0 010 1.5h-6.75v6.75a.75.75 0 01-1.5 0v-6.75H4.5a.75.75 0 010-1.5h6.75V4.5a.75.75 0 01.75-.75z" clipRule="evenodd" />
    </svg>
  );
}
