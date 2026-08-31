"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { logout } from "@/services/authService"

export function UserMenu() {
  const router = useRouter()
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    setUsername(localStorage.getItem("username"));
  }, []);

  function handleLogout() {
    logout()
    setUsername(null);
    router.push("/login")
  }

  return (
    <div className="flex items-center gap-3">
      {username && (
        <span className="hidden sm:inline text-sm font-medium text-gray-600 dark:text-gray-300 whitespace-nowrap">
          Welcome back, {username} 👋
        </span>
      )}
    <div className="flex items-center gap-2">
      <a
        href="/profile"
        aria-label="Profile"
        title="Profile"
        className="flex items-center justify-center w-9 h-9 rounded-xl border border-gray-200 bg-white text-gray-600 shadow-sm transition-all hover:border-sky-400 hover:text-sky-600 dark:border-white/10 dark:bg-white/5 dark:text-gray-400 dark:hover:border-sky-500 dark:hover:text-sky-400"
      >
        <UserIcon />
      </a>
      <button
        type="button"
        onClick={handleLogout}
        aria-label="Log out"
        title="Log out"
        className="flex items-center justify-center w-9 h-9 rounded-xl border border-gray-200 bg-white text-gray-600 shadow-sm transition-all hover:border-red-400 hover:text-red-600 dark:border-white/10 dark:bg-white/5 dark:text-gray-400 dark:hover:border-red-500 dark:hover:text-red-400 cursor-pointer"
      >
        <LogoutIcon />
      </button>
      </div>
    </div>
  )
}

function UserIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4" aria-hidden="true">
      <path fillRule="evenodd" d="M18.685 19.097A9.723 9.723 0 0021.75 12c0-5.385-4.365-9.75-9.75-9.75S2.25 6.615 2.25 12a9.723 9.723 0 003.065 7.097A9.716 9.716 0 0012 21.75a9.716 9.716 0 006.685-2.653zm-12.54-1.285A7.486 7.486 0 0112 15a7.486 7.486 0 015.855 2.812A8.224 8.224 0 0112 20.25a8.224 8.224 0 01-5.855-2.438zM15.75 9a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" clipRule="evenodd" />
    </svg>
  )
}

function LogoutIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4" aria-hidden="true">
      <path fillRule="evenodd" d="M7.5 3.75A1.5 1.5 0 006 5.25v13.5a1.5 1.5 0 001.5 1.5h6a1.5 1.5 0 001.5-1.5V15a.75.75 0 011.5 0v3.75a3 3 0 01-3 3h-6a3 3 0 01-3-3V5.25a3 3 0 013-3h6a3 3 0 013 3V9A.75.75 0 0115 9V5.25a1.5 1.5 0 00-1.5-1.5h-6z" clipRule="evenodd" />
      <path fillRule="evenodd" d="M6 12a.75.75 0 01.75-.75h9.546l-1.048-.943a.75.75 0 111.004-1.114l2.5 2.25a.75.75 0 010 1.114l-2.5 2.25a.75.75 0 11-1.004-1.114l1.048-.943H6.75A.75.75 0 016 12z" clipRule="evenodd" />
    </svg>
  )
}
