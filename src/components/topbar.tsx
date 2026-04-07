"use client";

import { Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { Sidebar } from "@/components/sidebar";
import { useState, useEffect } from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Listen for sidebar state changes from sidebar component
    const interval = setInterval(() => {
      const aside = document.querySelector("aside");
      if (aside) {
        setSidebarCollapsed(aside.offsetWidth < 100);
      }
    }, 100);
    return () => clearInterval(interval);
  }, []);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />
      <main
        className={cn(
          "min-h-screen transition-all duration-300",
          "ml-[72px]"
        )}
      >
        <div className="p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
