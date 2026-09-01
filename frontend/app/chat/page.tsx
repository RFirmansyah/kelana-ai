"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";
import { UserMenu } from "@/components/UserMenu";
import { ChatPanel } from "@/components/ChatPanel";

export default function ChatPage() {
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      router.replace("/login");
      return;
    }
    setCheckingAuth(false);
  }, [router]);

  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-[#0d1117]">
        <div className="w-8 h-8 rounded-full border-4 border-sky-100 border-t-sky-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 dark:bg-[#0d1117] dark:text-gray-100 px-5 py-10 transition-colors duration-200">
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="flex items-center justify-between">
          <Link
            href="/trips"
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors"
          >
            ← Back to My Trips
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <UserMenu />
          </div>
        </div>

        <ChatPanel heightClass="h-[65vh]" />
      </div>
    </div>
  );
}
