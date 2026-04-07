"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  ClipboardCheck,
  FileText,
  LogOut,
  ChevronLeft,
  WifiOff,
  RefreshCw,
} from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme-toggle";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/siswa", label: "Siswa", icon: Users },
  { href: "/pemeriksaan", label: "Pemeriksaan", icon: ClipboardCheck },
  { href: "/laporan", label: "Laporan", icon: FileText },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [pendingCount, setPendingCount] = useState(0);
  const [userName, setUserName] = useState("Petugas UKS");

  useEffect(() => {
    setIsOnline(navigator.onLine);

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
        "fixed left-0 top-0 h-full z-40 flex flex-col border-r transition-all duration-300",
        collapsed ? "w-[72px]" : "w-64",
        "dark:bg-slate-900 dark:border-slate-700",
        "bg-white border-slate-200"
      )}
    >
      {/* Logo */}
      <div
        className={cn(
          "flex items-center gap-3 px-4 py-5 border-b",
          collapsed && "justify-center",
          "dark:border-slate-700 border-slate-100"
        )}
      >
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-green-600 text-white shadow-sm flex-shrink-0 overflow-hidden">
          <img src="/logo-mbg.webp" alt="MBG" className="w-full h-full object-contain" />
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <h1 className="text-sm font-bold text-green-600 dark:text-green-400 leading-tight">
              MBG
            </h1>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 dark:text-slate-400 dark:text-slate-500 dark:text-slate-400 leading-tight">
              UKS Sekolah
            </p>
          </div>
        )}
      </div>

      {/* Status indicators */}
      {!isOnline && (
        <div className="mx-3 mt-3 flex items-center gap-2 rounded-xl bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700 px-3 py-2">
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
            "mx-3 mt-2 flex items-center gap-2 rounded-xl bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 px-3 py-2",
            !isOnline && "mt-1"
          )}
        >
          <RefreshCw className="h-4 w-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
          {!collapsed && (
            <span className="text-xs font-semibold text-blue-700 dark:text-blue-300">
              {pendingCount} menunggu sinkronisasi
            </span>
          )}
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200",
                isActive
                  ? "bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                  : "text-slate-500 dark:text-slate-400 dark:text-slate-400 dark:text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200",
                collapsed && "justify-center"
              )}
              title={collapsed ? item.label : undefined}
            >
              <item.icon
                className={cn(
                  "h-5 w-5 flex-shrink-0",
                  isActive ? "text-green-600 dark:text-green-400" : "text-slate-400 dark:text-slate-500 dark:text-slate-400 dark:text-slate-500 dark:text-slate-400"
                )}
              />
              {!collapsed && <span>{item.label}</span>}
              {item.href === "/pemeriksaan" && pendingCount > 0 && (
                <Badge variant="warning" className="ml-auto text-[10px] px-1.5">
                  {pendingCount}
                </Badge>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User + controls */}
      <div className={cn(
        "border-t px-3 py-4 space-y-2",
        "dark:border-slate-700 border-slate-100"
      )}>
        {/* Theme toggle */}
        <div className={cn("flex items-center", collapsed && "justify-center")}>
          <ThemeToggle />
          {!collapsed && (
            <span className="text-xs text-slate-400 dark:text-slate-500 dark:text-slate-400 dark:text-slate-500 dark:text-slate-400 ml-2">
              Ganti Tema
            </span>
          )}
        </div>

        {!collapsed && (
          <div className="px-3 py-2">
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-200 truncate">
              {userName}
            </p>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 dark:text-slate-400 dark:text-slate-500 dark:text-slate-400">Petugas UKS</p>
          </div>
        )}

        <Button
          variant="ghost"
          size={collapsed ? "md" : "md"}
          onClick={handleLogout}
          className={cn(
            "w-full text-slate-500 dark:text-slate-400 dark:text-slate-400 dark:text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20",
            collapsed && "justify-center px-0"
          )}
          title="Keluar"
        >
          <LogOut className="h-4 w-4" />
          {!collapsed && <span>Keluar</span>}
        </Button>

        {/* Collapse Toggle */}
        <button
          onClick={handleToggle}
          className={cn(
            "flex items-center gap-2 px-3 py-2 w-full text-xs text-slate-400 dark:text-slate-500 dark:text-slate-400 dark:text-slate-500 dark:text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-xl transition-colors",
            collapsed && "justify-center"
          )}
        >
          <ChevronLeft
            className={cn(
              "h-4 w-4 transition-transform duration-300",
              collapsed && "rotate-180"
            )}
          />
          {!collapsed && <span>Sembunyikan</span>}
        </button>
      </div>
    </aside>
  );
}
