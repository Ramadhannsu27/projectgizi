"use client";

import { Sidebar } from "@/components/sidebar";
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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Sidebar />
      <main
        className="min-h-screen transition-all duration-300"
        style={{ marginLeft: sidebarCollapsed ? "72px" : "256px" }}
      >
        <div className="p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
