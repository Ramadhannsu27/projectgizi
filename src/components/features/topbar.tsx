"use client";

import { useState, useEffect } from "react";
import { Bell, ChevronDown, WifiOff, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

export function TopBar() {
  const [userName, setUserName] = useState("Petugas UKS");
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    const stored = localStorage.getItem("user_name");
    if (stored) setUserName(stored);

    const pending = localStorage.getItem("pending_measurements");
    if (pending) {
      try {
        const arr = JSON.parse(pending);
        setPendingCount(Array.isArray(arr) ? arr.length : 0);
      } catch {
        setPendingCount(0);
      }
    }
  }, []);

  return (
    <header className="sticky top-0 z-30 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
      <div className="flex items-center justify-between h-[60px] px-6">
        {/* Title */}
        <div>
          <h1 className="text-lg font-bold text-slate-800 dark:text-slate-100">
            Dashboard
          </h1>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {/* Pending sync indicator */}
          {pendingCount > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700 text-amber-700 dark:text-amber-300 text-xs font-semibold">
              <RefreshCw className="h-3.5 w-3.5 animate-spin" />
              {pendingCount}
            </div>
          )}

          {/* Notification */}
          <button className="relative p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-slate-500 dark:text-slate-400">
            <Bell className="h-5 w-5" />
            {pendingCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-green-500 border border-white dark:border-slate-900" />
            )}
          </button>

          {/* User Profile */}
          <button className="flex items-center gap-3 pl-3 pr-2 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 leading-tight">
                {userName}
              </p>
              <p className="text-xs text-slate-400 dark:text-slate-500 leading-tight">
                Petugas UKS
              </p>
            </div>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center text-white font-bold text-sm shadow-sm flex-shrink-0 overflow-hidden">
              {userName.charAt(0).toUpperCase()}
            </div>
            <ChevronDown className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500 flex-shrink-0 hidden sm:block" />
          </button>
        </div>
      </div>
    </header>
  );
}
