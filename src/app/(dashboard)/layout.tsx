"use client";

import { Sidebar } from "@/components/features/sidebar";
import { TopBar } from "@/components/features/topbar";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Menu, LayoutDashboard, Users, ClipboardCheck, FileText } from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleSidebarChange = (e: CustomEvent<{ collapsed: boolean }>) => {
      setSidebarCollapsed(e.detail.collapsed);
    };
    window.addEventListener("sidebar-toggle" as any, handleSidebarChange as EventListener);
    return () => {
      window.removeEventListener("sidebar-toggle" as any, handleSidebarChange as EventListener);
    };
  }, []);

  // Close mobile sidebar on resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setMobileOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950">
      {/* Mobile header — only visible on mobile */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 px-3 py-2 flex items-center gap-2">
        <button
          onClick={() => setMobileOpen(true)}
          className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex-shrink-0"
        >
          <Menu className="h-5 w-5 text-slate-600 dark:text-slate-300" />
        </button>
        <img src="/logo-mbg.webp" alt="MBG" className="h-7 w-auto flex-shrink-0" />
        <span className="font-bold text-slate-800 dark:text-white text-sm truncate">Project Gizi</span>
      </div>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-50 bg-black/50"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile sidebar drawer — inline nav, full height */}
      <div
        className={`
          lg:hidden fixed top-0 left-0 bottom-0 z-50 bg-slate-900 shadow-2xl transition-transform duration-300 w-[200px]
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <nav className="flex flex-col h-full overflow-y-auto">
          <div className="flex items-center gap-2 px-4 py-4 border-b border-slate-700">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center overflow-hidden flex-shrink-0">
              <img src="/logo-mbg.webp" alt="MBG" className="w-full h-full object-contain" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-extrabold text-green-400 leading-tight truncate">Monitoring Gizi</p>
              <p className="text-[10px] text-slate-400 leading-tight truncate">SD / MI / SMP / SMA</p>
            </div>
          </div>
          <div className="flex-1 py-2 px-2 space-y-1">
            {[
              { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
              { href: "/siswa", label: "Siswa", icon: Users },
              { href: "/pemeriksaan", label: "Pemeriksaan", icon: ClipboardCheck },
              { href: "/laporan", label: "Laporan", icon: FileText },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 px-3 py-3 min-h-[48px] rounded-xl text-sm font-semibold text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                <span>{item.label}</span>
              </Link>
            ))}
          </div>
          <div className="border-t border-slate-700 p-2">
            <button
              onClick={() => { localStorage.removeItem("auth_token"); localStorage.removeItem("user_name"); router.push("/login"); }}
              className="flex items-center gap-3 w-full px-3 py-3 min-h-[48px] rounded-xl text-sm font-semibold text-slate-400 hover:bg-red-900/20 hover:text-red-400 transition-colors"
            >
              <span>Keluar</span>
            </button>
          </div>
        </nav>
      </div>

      {/* Desktop sidebar — hide on touch devices */}
      <div className="hidden lg:block force-mobile-sidebar-hide">
        <Sidebar />
      </div>

      {/* Main content */}
      <main
        className="min-h-screen transition-all duration-300 force-mobile-full"
        style={{
          marginLeft: sidebarCollapsed ? "72px" : "260px",
        }}
      >
        {/* Mobile top padding */}
        <div className="lg:hidden h-12" />
        <TopBar />
        <div className="p-3 sm:p-5 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
