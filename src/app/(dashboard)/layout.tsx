"use client";

import { Sidebar } from "@/components/features/sidebar";
import { TopBar } from "@/components/features/topbar";
import { useState, useEffect } from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    const handleSidebarChange = (e: CustomEvent<{ collapsed: boolean }>) => {
      setSidebarCollapsed(e.detail.collapsed);
    };
    window.addEventListener("sidebar-toggle" as any, handleSidebarChange as EventListener);
    return () => {
      window.removeEventListener("sidebar-toggle" as any, handleSidebarChange as EventListener);
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950">
      <Sidebar />
      <main
        className="min-h-screen transition-all duration-300"
        style={{ marginLeft: sidebarCollapsed ? "72px" : "260px" }}
      >
        <TopBar />
        <div className="p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
