"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn, isAuthenticated } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  ClipboardCheck,
  FileText,
  LogOut,
  ChevronLeft,
  ChevronRight,
  WifiOff,
  RefreshCw,
} from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/features/theme-toggle";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/siswa", label: "Siswa", icon: Users },
  { href: "/pemeriksaan", label: "Pemeriksaan", icon: ClipboardCheck },
  { href: "/laporan", label: "Laporan", icon: FileText },
];

export function Sidebar({ hideHeader = false }: { hideHeader?: boolean }) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [pendingCount, setPendingCount] = useState(0);
  const [userName, setUserName] = useState("Petugas UKS");
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    setAuthed(isAuthenticated());

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    const pending = localStorage.getItem("pending_measurements");
    if (pending) {
      try {
        const arr = JSON.parse(pending);
        setPendingCount(Array.isArray(arr) ? arr.length : 0);
      } catch {
        setPendingCount(0);
      }
    }

    const stored = localStorage.getItem("user_name");
    if (stored) setUserName(stored);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user_name");
    router.push("/login");
  };

  const handleToggle = () => {
    const next = !collapsed;
    setCollapsed(next);
    window.dispatchEvent(new CustomEvent("sidebar-toggle", { detail: { collapsed: next } }));
  };

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 h-screen z-40 flex flex-col border-r transition-all duration-300 overflow-hidden",
        collapsed ? "w-[72px]" : "w-[260px]",
        "bg-slate-900 border-slate-700 dark:bg-slate-900 dark:border-slate-700"
      )}
    >
      {/* Logo */}
      {!hideHeader && (
        <div
          className={cn(
            "flex items-center gap-3 px-4 py-3 border-b transition-all flex-shrink-0",
            collapsed && "justify-center",
            "border-slate-700 dark:border-slate-700"
          )}
        >
          <div className="flex items-center justify-center w-10 h-10 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-sm flex-shrink-0 overflow-hidden ring-2 ring-green-500/10">
            <img src="/logo-mbg.webp" alt="MBG" className="w-full h-full object-contain" />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <h1 className="text-base font-extrabold text-green-400 leading-tight tracking-tight">
                Monitoring Gizi
              </h1>
              <p className="text-[11px] text-slate-400 leading-tight">
                SD / MI / SMP / SMA Negeri
              </p>
            </div>
          )}
        </div>
      )}

      {/* Status indicators */}
      {/* Status indicators */}
      {!isOnline && (
        <div className={cn(
          "mx-3 mt-2 flex items-center gap-2 rounded-xl bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700 px-3 py-2 transition-all flex-shrink-0",
          collapsed && "mx-2 justify-center p-2"
        )}>
          <WifiOff className="h-4 w-4 text-amber-600 dark:text-amber-400 flex-shrink-0" />
          {!collapsed && (
            <span className="text-xs font-semibold text-amber-700 dark:text-amber-300">
              Mode Offline
            </span>
          )}
        </div>
      )}

      {pendingCount > 0 && (
        <div
          className={cn(
            "mx-3 mt-1 flex items-center gap-2 rounded-xl bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 px-3 py-2 transition-all flex-shrink-0",
            collapsed && "mx-2 justify-center p-2"
          )}
        >
          <RefreshCw className="h-4 w-4 text-blue-600 dark:text-blue-400 flex-shrink-0 animate-spin" />
          {!collapsed && (
            <span className="text-xs font-semibold text-blue-700 dark:text-blue-300">
              {pendingCount} sinkron
            </span>
          )}
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto scrollbar-hide">
        <p className={cn(
          "px-3 text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2 transition-all",
          collapsed && "text-center px-0"
        )}>
          {collapsed ? "•••" : "Menu"}
        </p>
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center gap-3 px-3 py-3 min-h-[48px] rounded-xl text-sm font-semibold transition-all duration-200 relative",
                isActive
                  ? "bg-green-600 text-white shadow-sm shadow-green-600/20"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white",
                collapsed && "justify-center px-0"
              )}
              title={collapsed ? item.label : undefined}
            >
              {/* Active indicator */}
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r-full bg-white/30" />
              )}
              <item.icon
                className={cn(
                  "h-5 w-5 flex-shrink-0 transition-colors",
                  isActive ? "text-white" : "text-slate-400 group-hover:text-slate-200"
                )}
              />
              {!collapsed && <span>{item.label}</span>}
              {item.href === "/pemeriksaan" && pendingCount > 0 && (
                <span className="ml-auto w-5 h-5 rounded-full bg-white/20 text-white text-[10px] font-bold flex items-center justify-center">
                  {pendingCount}
                </span>
              )}
              {item.href === "/pemeriksaan" && pendingCount === 0 && (
                <span className={cn(
                  "ml-auto text-[10px] font-medium text-slate-400 dark:text-slate-600",
                  collapsed && "hidden"
                )}>
                  Baru
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Section */}
      <div className={cn(
        "border-t px-3 py-3 space-y-1 transition-all flex-shrink-0",
        "border-slate-700 dark:border-slate-700",
        collapsed && "px-2"
      )}>
        {/* Theme toggle */}
        <div className={cn(
          "flex items-center rounded-xl px-3 py-2 hover:bg-slate-800 transition-colors cursor-pointer",
          collapsed && "justify-center px-0"
        )}>
          <ThemeToggle />
          {!collapsed && (
            <span className="text-xs text-slate-400 ml-3 font-medium">
              Ganti Tema
            </span>
          )}
        </div>

        {/* User info */}
        {!collapsed && (
          <div className="px-3 py-2 rounded-xl hover:bg-slate-800 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center text-white font-bold text-sm shadow-sm flex-shrink-0">
                {userName.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-slate-100 truncate">
                  {authed ? userName : "Pengunjung"}
                </p>
                <p className="text-[11px] text-slate-400">
                  {authed ? "Petugas UKS" : "Mode lihat saja"}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Login / Logout */}
        {authed ? (
          <button
            onClick={handleLogout}
            className={cn(
              "flex items-center gap-3 px-3 py-3 min-h-[48px] w-full text-sm font-semibold text-slate-300 rounded-xl hover:bg-red-900/20 hover:text-red-400 transition-colors",
              collapsed && "justify-center px-0"
            )}
            title="Keluar"
          >
            <LogOut className="h-4 w-4 flex-shrink-0" />
            {!collapsed && <span>Keluar</span>}
          </button>
        ) : (
          <button
            onClick={() => router.push("/login")}
            className={cn(
              "flex items-center gap-3 px-3 py-3 min-h-[48px] w-full text-sm font-semibold rounded-xl bg-green-600 hover:bg-green-500 text-white transition-colors",
              collapsed && "justify-center px-0"
            )}
            title="Login"
          >
            <span className="h-4 w-4 flex-shrink-0 flex items-center justify-center font-bold">→</span>
            {!collapsed && <span>Masuk / Login</span>}
          </button>
        )}

        {/* Collapse Toggle */}
        <button
          onClick={handleToggle}
          className={cn(
            "flex items-center gap-2 px-3 py-2 w-full text-xs font-medium text-slate-500 hover:text-slate-300 rounded-xl transition-colors",
            collapsed && "justify-center px-0"
          )}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <>
              <ChevronLeft className="h-4 w-4" />
              <span>Sembunyikan</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
