"use client";

import { Sidebar } from "@/components/features/sidebar";
import { TopBar } from "@/components/features/topbar";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => setMobileOpen(true)}
          className="p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <Menu className="h-5 w-5 text-slate-600 dark:text-slate-300" />
        </button>
        <img src="/logo-mbg.webp" alt="MBG" className="h-8 w-auto" />
        <span className="font-bold text-slate-800 dark:text-white text-sm">Project Gizi</span>
      </div>

      {/* Desktop mode hint — floating button for mobile */}
      <div className="lg:hidden fixed bottom-4 right-4 z-40">
        <a
          href="javascript:void(0)"
          onClick={() => alert('Aktifkan Desktop Mode di browser:\n\nChrome: ⋮ → ✅ Desktop site\nSafari: Share → Desktop Website\n\nAtau putar HP ke landscape')}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-3 rounded-2xl shadow-lg text-xs font-semibold"
        >
          💻 Desktop Mode
        </a>
      </div>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-50 bg-black/40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile sidebar drawer — only visible on mobile */}
      <div
        className={`
          lg:hidden fixed top-0 left-0 bottom-0 z-50 bg-white dark:bg-slate-900 shadow-xl transition-transform duration-300 w-[260px]
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
          <img src="/logo-mbg.webp" alt="MBG" className="h-8 w-auto" />
          <button
            onClick={() => setMobileOpen(false)}
            className="p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="h-5 w-5 text-slate-500" />
          </button>
        </div>
        <Sidebar />
      </div>

      {/* Desktop sidebar — only visible on lg+ */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* Main content — responsive margin */}
      <main
        className="min-h-screen transition-all duration-300"
        style={{
          // No margin on mobile (sidebar hidden), margin only on lg+
          marginLeft: sidebarCollapsed ? "72px" : "260px",
        }}
      >
        {/* Mobile top padding — only on mobile to account for fixed header */}
        <div className="lg:hidden h-14" />
        <TopBar />
        <div className="p-4 sm:p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
