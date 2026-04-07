"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Users,
  ClipboardCheck,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Trash2,
  RotateCcw,
  RotateCw,
  Activity,
  Clock,
  TrendingDown,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { formatDateTime } from "@/lib/utils";
import { toast } from "sonner";

const STATUS_COLORS: Record<string, string> = {
  Normal: "#16a34a",
  Overweight: "#f59e0b",
  Obesitas: "#dc2626",
  Stunting: "#ea580c",
  "Stunting Berat": "#c2410c",
};

interface DashboardStats {
  totalSiswa: number;
  diperiksaHariIni: number;
  persentaseNormal: number;
  perluPerhatian: number;
}

interface RecentMeasurement {
  id: number;
  student_name: string;
  class_name: string;
  height: number;
  weight: number;
  bmi: number;
  status_category: string;
  checked_at: string;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recent, setRecent] = useState<RecentMeasurement[]>([]);
  const [chartData, setChartData] = useState<
    { name: string; value: number; color: string }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [pendingCount, setPendingCount] = useState(0);
  const [undoStack, setUndoStack] = useState<RecentMeasurement[]>([]);
  const [redoStack, setRedoStack] = useState<RecentMeasurement[]>([]);
  const undoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Undo: restore last deleted item
  const handleUndo = () => {
    if (undoStack.length === 0) return;
    const last = undoStack[undoStack.length - 1];
    setUndoStack((s) => s.slice(0, -1));
    setRedoStack((s) => [...s, last]);
    setRecent((prev) => [last, ...prev]);
    if (undoTimerRef.current) {
      clearTimeout(undoTimerRef.current);
      undoTimerRef.current = null;
    }
    toast.success(`"${last.student_name}" dikembalikan`);
  };

  // Redo: re-delete the last undone item
  const handleRedo = async () => {
    if (redoStack.length === 0) return;
    const last = redoStack[redoStack.length - 1];
    setRedoStack((s) => s.slice(0, -1));
    try {
      await fetch(`/api/measurements/${last.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
      });
    } catch {
      // ignore
    }
    toast.info(`"${last.student_name}" dihapus`);
  };

  // Delete measurement from recent list (soft delete first, permanent after timer)
  const handleDeleteRecent = async (m: RecentMeasurement) => {
    setRecent((prev) => prev.filter((item) => item.id !== m.id));
    setUndoStack((s) => [...s, m]);
    setRedoStack([]);

    const undoToastId = Math.random().toString(36).slice(2);

    toast(
      <div className="flex items-center gap-3">
        <span>"{m.student_name}" dihapus</span>
        <button
          onClick={() => {
            handleUndo();
            toast.dismiss(undoToastId);
          }}
          className="underline font-bold text-white hover:text-green-200 ml-2"
        >
          Undo
        </button>
      </div>,
      { id: undoToastId, duration: 10000 }
    );

    if (undoTimerRef.current) {
      clearTimeout(undoTimerRef.current);
    }
    undoTimerRef.current = setTimeout(async () => {
      try {
        await fetch(`/api/measurements/${m.id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
          },
        });
      } catch {
        // ignore
      }
      setUndoStack([]);
      toast.dismiss(undoToastId);
    }, 10000);
  };

  useEffect(() => {
    try {
      const pending = JSON.parse(localStorage.getItem("pending_measurements") || "[]");
      setPendingCount(pending.length);
    } catch {
      setPendingCount(0);
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, recentRes] = await Promise.all([
          fetch("/api/dashboard/stats", {
            headers: { Authorization: `Bearer ${localStorage.getItem("auth_token")}` },
          }),
          fetch("/api/dashboard/recent", {
            headers: { Authorization: `Bearer ${localStorage.getItem("auth_token")}` },
          }),
        ]);

        if (statsRes.ok) {
          const s = await statsRes.json();
          setStats(s);
          if (s.distribution) {
            setChartData(
              s.distribution.map((d: { status: string; count: number }) => ({
                name: d.status,
                value: d.count,
                color: STATUS_COLORS[d.status] || "#94a3b8",
              }))
            );
          }
        }

        if (recentRes.ok) {
          const r = await recentRes.json();
          setRecent(r);
        }
      } catch {
        setStats({
          totalSiswa: 0,
          diperiksaHariIni: 0,
          persentaseNormal: 0,
          perluPerhatian: 0,
        });
        setRecent([]);
        setChartData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Determine trend based on percentage normal
  const normalPercent = stats?.persentaseNormal ?? 0;
  const trendPercent = normalPercent >= 70 ? "up" : normalPercent >= 40 ? "stable" : "down";
  const trendColor = trendPercent === "up" ? "text-green-600" : trendPercent === "down" ? "text-red-600" : "text-amber-600";
  const TrendIcon = trendPercent === "up" ? TrendingUp : trendPercent === "down" ? TrendingDown : Activity;

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 dark:text-slate-200">Dashboard</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Ringkasan status gizi siswa sekolah
          </p>
        </div>
        <div className="flex items-center gap-3">
          {pendingCount > 0 && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-sm font-semibold">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              {pendingCount} data belum sinkron
            </span>
          )}
          <Link href="/pemeriksaan">
            <Button variant="primary" size="lg" className="shadow-md shadow-green-200 dark:shadow-green-900/30">
              <ClipboardCheck className="h-5 w-5" />
              Mulai Pemeriksaan
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards - Redesigned */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="border-slate-100 dark:border-slate-800">
                <CardContent className="p-5">
                  <Skeleton className="h-4 w-1/2 mb-3" />
                  <Skeleton className="h-8 w-1/3" />
                </CardContent>
              </Card>
            ))
          : [
              {
                label: "Total Siswa",
                value: stats?.totalSiswa ?? 0,
                icon: Users,
                gradient: "from-blue-500 to-blue-600",
                iconBg: "bg-blue-100 dark:bg-blue-900/40",
                iconColor: "text-blue-600 dark:text-blue-400",
                href: "/siswa",
                hoverBg: "hover:bg-blue-50 dark:hover:bg-blue-950/30",
              },
              {
                label: "Diperiksa Hari Ini",
                value: stats?.diperiksaHariIni ?? 0,
                icon: ClipboardCheck,
                gradient: "from-violet-500 to-violet-600",
                iconBg: "bg-violet-100 dark:bg-violet-900/40",
                iconColor: "text-violet-600 dark:text-violet-400",
                href: `/laporan?date=${today}`,
                hoverBg: "hover:bg-violet-50 dark:hover:bg-violet-950/30",
              },
              {
                label: "Persentase Normal",
                value: `${stats?.persentaseNormal ?? 0}%`,
                icon: CheckCircle,
                gradient: "from-emerald-500 to-emerald-600",
                iconBg: "bg-emerald-100 dark:bg-emerald-900/40",
                iconColor: "text-emerald-600 dark:text-emerald-400",
                href: "/laporan?status=Normal",
                hoverBg: "hover:bg-emerald-50 dark:hover:bg-emerald-950/30",
                trend: true,
              },
              {
                label: "Perlu Perhatian",
                value: stats?.perluPerhatian ?? 0,
                icon: AlertTriangle,
                gradient: "from-rose-500 to-rose-600",
                iconBg: "bg-rose-100 dark:bg-rose-900/40",
                iconColor: "text-rose-600 dark:text-rose-400",
                href: "/laporan?status=Obesitas",
                hoverBg: "hover:bg-rose-50 dark:hover:bg-rose-950/30",
              },
            ].map((card, i) => (
              <Link key={i} href={card.href}>
                <Card
                  className={`overflow-hidden hover:shadow-lg transition-all duration-300 border-slate-100 dark:border-slate-800 hover:-translate-y-0.5 cursor-pointer ${card.hoverBg}`}
                >
                  <div className={`h-1 bg-gradient-to-r ${card.gradient}`} />
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                          {card.label}
                        </p>
                        <div className="flex items-end gap-2 mt-1">
                          <p className="text-3xl font-extrabold text-slate-800 dark:text-slate-200">
                            {card.value}
                          </p>
                          {card.trend && (
                            <span className={`flex items-center gap-0.5 text-xs font-bold ${trendColor} mb-1`}>
                              <TrendIcon className="h-3.5 w-3.5" />
                            </span>
                          )}
                        </div>
                      </div>
                      <div className={`p-2.5 rounded-xl ${card.iconBg} ${card.iconColor}`}>
                        <card.icon className="h-5 w-5" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
      </div>

      {/* Chart + Recent - Redesigned */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Chart - Redesigned */}
        <Card className="lg:col-span-2 border-slate-100 dark:border-slate-800 overflow-hidden">
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-white/80" />
              <h2 className="text-base font-bold text-white">
                Distribusi Status Gizi
              </h2>
            </div>
          </div>
          <CardContent className="p-5">
            {loading ? (
              <Skeleton className="h-56 w-full rounded-xl" />
            ) : chartData.length > 0 ? (
              <div className="relative">
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={90}
                      paddingAngle={4}
                      dataKey="value"
                      strokeWidth={0}
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        borderRadius: 10,
                        border: "1px solid #e2e8f0",
                        fontSize: 12,
                        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                      }}
                      formatter={(value: number, name: string) => [`${value} siswa`, name]}
                    />
                    <Legend
                      iconType="circle"
                      iconSize={8}
                      wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-56 flex flex-col items-center justify-center text-slate-400 space-y-3">
                <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                  <TrendingUp className="h-8 w-8 opacity-30" />
                </div>
                <p className="text-sm">Belum ada data pemeriksaan</p>
                <Link href="/pemeriksaan">
                  <Button variant="outline" size="sm">
                    Mulai Pemeriksaan
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent - Redesigned */}
        <Card className="lg:col-span-3 border-slate-100 dark:border-slate-800 overflow-hidden">
          <div className="bg-white dark:bg-slate-800 px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-slate-500 dark:text-slate-400" />
              <h2 className="text-base font-bold text-slate-800 dark:text-slate-200">
                Pemeriksaan Terbaru
              </h2>
            </div>
            <div className="flex items-center gap-2">
              {redoStack.length > 0 && (
                <button
                  onClick={handleRedo}
                  title="Redo"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                >
                  <RotateCw className="h-4 w-4" />
                </button>
              )}
              {undoStack.length > 0 && (
                <button
                  onClick={handleUndo}
                  title="Undo"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-green-600 hover:bg-green-50 transition-colors"
                >
                  <RotateCcw className="h-4 w-4" />
                </button>
              )}
              <Link href="/laporan">
                <Button variant="ghost" size="sm" className="text-green-600 hover:text-green-700 hover:bg-green-50">
                  Lihat Semua
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-4 space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-14 w-full rounded-xl" />
                ))}
              </div>
            ) : recent.length > 0 ? (
              <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
                {recent.map((m) => (
                  <div
                    key={m.id}
                    className="flex items-center px-5 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group"
                  >
                    {/* Avatar */}
                    <div className="flex-shrink-0 mr-4">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                        {m.student_name.charAt(0).toUpperCase()}
                      </div>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">
                        {m.student_name}
                      </p>
                      <p className="text-xs text-slate-400 dark:text-slate-500">
                        {m.class_name} &middot; {formatDateTime(m.checked_at)}
                      </p>
                    </div>

                    {/* Stats */}
                    <div className="hidden sm:flex items-center gap-6 mr-4">
                      <div className="text-center">
                        <p className="text-xs text-slate-400 dark:text-slate-500">TB</p>
                        <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                          {typeof m.height === 'number' ? m.height : parseFloat(m.height)} cm
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-slate-400 dark:text-slate-500">BB</p>
                        <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                          {typeof m.weight === 'number' ? m.weight : parseFloat(m.weight)} kg
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-slate-400 dark:text-slate-500">IMT</p>
                        <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                          {typeof m.bmi === 'number' ? m.bmi.toFixed(1) : parseFloat(m.bmi).toFixed(1)}
                        </p>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <Badge
                      variant={
                        m.status_category === "Normal"
                          ? "normal"
                          : m.status_category === "Obesitas"
                          ? "obesitas"
                          : m.status_category === "Overweight"
                          ? "overweight"
                          : m.status_category === "Stunting"
                          ? "stunting"
                          : "secondary"
                      }
                      className="mr-3"
                    >
                      {m.status_category}
                    </Badge>

                    {/* Delete */}
                    <button
                      onClick={() => handleDeleteRecent(m)}
                      className="p-1.5 rounded-lg text-slate-300 hover:text-red-600 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-16 flex flex-col items-center justify-center text-slate-400 space-y-3">
                <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                  <ClipboardCheck className="h-8 w-8 opacity-30" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Belum ada pemeriksaan</p>
                  <p className="text-xs mt-1">Mulai pemeriksaan pertama untuk melihat data</p>
                </div>
                <Link href="/pemeriksaan">
                  <Button variant="outline" size="sm">
                    Mulai Pemeriksaan
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions Banner */}
      <Card className="border-0 bg-gradient-to-r from-green-600 to-emerald-600 text-white overflow-hidden">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
                <Sparkles className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold">Pemeriksaan Baru</h3>
                <p className="text-sm text-green-100">
                  Catat hasil pengukuran dan pantau status gizi siswa
                </p>
              </div>
            </div>
            <Link href="/pemeriksaan">
              <Button
                variant="outline"
                size="lg"
                className="bg-white text-green-700 hover:bg-green-50 border-0 shadow-lg font-bold"
              >
                <ClipboardCheck className="h-5 w-5" />
                Mulai Sekarang
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
