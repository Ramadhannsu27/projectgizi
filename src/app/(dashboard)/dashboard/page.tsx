"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Users,
  ClipboardCheck,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Minus,
  ChevronRight,
  ArrowRight,
  Clock,
  WifiOff,
  RefreshCw,
  Target,
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
import { formatDateTime, isAuthenticated, cn } from "@/lib/utils";

const B = "border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800";
const BH = "px-5 py-3.5 border-b border-slate-200 dark:border-slate-700";
const TH = "bg-slate-50 dark:bg-slate-800/60 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider";

const STATUS_COLORS: Record<string, string> = {
  Normal: "#16a34a",
  Overweight: "#f59e0b",
  Obesitas: "#dc2626",
  Stunting: "#ea580c",
  "Stunting Berat": "#c2410c",
};

const STATUS_BADGE: Record<string, "normal" | "obesitas" | "overweight" | "stunting" | "severely_stunting" | "info"> = {
  Normal: "normal",
  Overweight: "overweight",
  Obesitas: "obesitas",
  Stunting: "stunting",
  "Stunting Berat": "severely_stunting",
};

interface DashboardStats {
  totalSiswa: number;
  diperiksaHariIni: number;
  persentaseNormal: number;
  perluPerhatian: number;
  distribution: { status: string; count: number }[];
}

interface ClassSummary {
  school_name: string;
  class_name: string;
  total_students: number;
  measured: number;
  normal_percent: number;
  status: string;
  progress: number;
}

interface SchoolSummary {
  school_name: string;
  total_students: number;
  measured: number;
  normal_percent: number;
  progress: number;
}

interface RecentMeasurement {
  id: number;
  student_name: string;
  student_class: string;
  student_school_name: string;
  height: number;
  weight: number;
  bmi: number;
  status_category: string;
  checked_at: string;
}

const STAT_CARDS = [
  { label: "Total Siswa", icon: Users, color: "blue", border: "border-t-2 border-blue-500", bg: "bg-blue-50 dark:bg-blue-900/20", text: "text-blue-500" },
  { label: "Diperiksa Hari Ini", icon: ClipboardCheck, color: "violet", border: "border-t-2 border-violet-500", bg: "bg-violet-50 dark:bg-violet-900/20", text: "text-violet-500" },
  { label: "Persentase Normal", icon: CheckCircle, color: "green", border: "border-t-2 border-green-500", bg: "bg-green-50 dark:bg-green-900/20", text: "text-green-500" },
  { label: "Perlu Perhatian", icon: AlertTriangle, color: "rose", border: "border-t-2 border-rose-500", bg: "bg-rose-50 dark:bg-rose-900/20", text: "text-rose-500" },
] as const;

function StatSkeleton() {
  return (
    <Card className={`${B} overflow-hidden`}>
      <CardContent className="p-5">
        <Skeleton className="h-10 w-10 rounded-xl mb-3" />
        <Skeleton className="h-3 w-20 mb-2" />
        <Skeleton className="h-8 w-16 mb-2" />
        <Skeleton className="h-3 w-28" />
      </CardContent>
    </Card>
  );
}

function StatCard({
  card,
  value,
  change,
  changeDir,
  href,
  note,
}: {
  card: typeof STAT_CARDS[number];
  value: string | number;
  change?: number;
  changeDir?: string;
  href: string;
  note?: string;
}) {
  return (
    <Link href={href}>
      <Card className={`${B} ${card.border} overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer`}>
        <CardContent className="p-5">
          <div className="flex items-start justify-between mb-3">
            <div className={`p-2.5 rounded-xl ${card.bg}`}>
              <card.icon className={`h-5 w-5 ${card.text}`} />
            </div>
            {change !== undefined && (
              <div className={`flex items-center gap-0.5 text-xs font-bold px-2 py-1 rounded-full ${
                changeDir === "up"
                  ? "text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400"
                  : changeDir === "down"
                  ? "text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400"
                  : "text-slate-500 bg-slate-100 dark:bg-slate-700 dark:text-slate-400"
              }`}>
                {changeDir === "up" ? <TrendingUp className="h-3 w-3" />
                  : changeDir === "down" ? <TrendingDown className="h-3 w-3" />
                  : <Minus className="h-3 w-3" />}
                {change}%
              </div>
            )}
          </div>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            {card.label}
          </p>
          <p className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 mt-1">
            {value}
          </p>
          {note && (
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{note}</p>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [summary, setSummary] = useState<{ classes: ClassSummary[]; schools: SchoolSummary[]; today_change: number } | null>(null);
  const [selectedSchool, setSelectedSchool] = useState<string>("all");
  const [recent, setRecent] = useState<RecentMeasurement[]>([]);
  const [loading, setLoading] = useState(true);
  const [pendingCount, setPendingCount] = useState(0);
  const [isOnline, setIsOnline] = useState(true);
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    setAuthed(isAuthenticated());
    setIsOnline(navigator.onLine);
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    try {
      const pending = JSON.parse(localStorage.getItem("pending_measurements") || "[]");
      setPendingCount(pending.length);
    } catch {
      setPendingCount(0);
    }

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("auth_token");
        const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

        const [statsRes, summaryRes, recentRes] = await Promise.all([
          fetch("/api/dashboard/stats", { headers }),
          fetch("/api/dashboard/summary", { headers }),
          fetch("/api/dashboard/recent", { headers }),
        ]);

        if (statsRes.ok) setStats(await statsRes.json());
        if (summaryRes.ok) setSummary(await summaryRes.json());
        if (recentRes.ok) setRecent(await recentRes.json());
      } catch {
        setStats({ totalSiswa: 0, diperiksaHariIni: 0, persentaseNormal: 0, perluPerhatian: 0, distribution: [] });
        setSummary({ classes: [], schools: [], today_change: 0 });
        setRecent([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const chartData = stats?.distribution.map((d) => ({
    name: d.status,
    value: Number(d.count),
    color: STATUS_COLORS[d.status] || "#94a3b8",
  })) || [];

  const totalMeasured = stats?.distribution.reduce((sum, d) => sum + Number(d.count), 0) || 0;
  const normalCount = stats?.distribution.find((d) => d.status === "Normal")?.count || 0;
  const completedPercent = totalMeasured > 0 ? Math.round((Number(normalCount) / totalMeasured) * 100) : 0;

  const getTrend = (current: number, prev: number) => {
    if (prev === 0) return current > 0 ? { dir: "up", val: 100 } : { dir: "neutral", val: 0 };
    const change = Math.round(((current - prev) / prev) * 100);
    return { dir: change > 0 ? "up" : change < 0 ? "down" : "neutral", val: Math.abs(change) };
  };

  const normalTrend = getTrend(stats?.persentaseNormal || 0, 0);
  const perluTrend = getTrend(stats?.perluPerhatian || 0, 0);

  const filteredMeasurements = selectedSchool === "all"
    ? recent
    : recent.filter((m) => m.student_school_name === selectedSchool);


  // Calculate filtered stats based on selected school
  const filteredSchoolData = selectedSchool !== "all" && summary?.schools
    ? summary.schools.find(s => s.school_name === selectedSchool)
    : null;

  const filteredTotalSiswa = filteredSchoolData ? filteredSchoolData.total_students : (stats?.totalSiswa ?? 0);
  const filteredDiperiksa = filteredSchoolData ? filteredSchoolData.measured : (stats?.diperiksaHariIni ?? 0);
  const filteredNormal = filteredSchoolData ? filteredSchoolData.normal_percent : (stats?.persentaseNormal ?? 0);
  const filteredPerhatian = filteredSchoolData
    ? Math.round(filteredSchoolData.measured - (filteredSchoolData.measured * filteredSchoolData.normal_percent / 100))
    : (stats?.perluPerhatian ?? 0);

  const statValues = [
    filteredTotalSiswa,
    filteredDiperiksa,
    `${filteredNormal}%`,
    filteredPerhatian,
  ];
  const statHrefs = ["/siswa", "/pemeriksaan", "/laporan?status=Normal", "/laporan?status=Obesitas"];
  const statNotes = [
    selectedSchool !== "all" ? selectedSchool : undefined,
    selectedSchool !== "all" ? undefined : "dari kemarin",
    selectedSchool !== "all" ? undefined : "dari periode sebelumnya",
    selectedSchool !== "all" ? undefined : "dari periode sebelumnya",
  ];
  const statChanges = [undefined, summary?.today_change ?? 0, normalTrend.val, perluTrend.val];
  const statDirs = [undefined, undefined, normalTrend.dir, perluTrend.dir === "down" ? "up" : perluTrend.dir === "up" ? "down" : "neutral"];

  return (
    <div className="space-y-5">
      {/* Offline Banner */}
      {!isOnline && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700 text-amber-700 dark:text-amber-300 text-sm font-semibold">
          <WifiOff className="h-4 w-4" />
          Mode Offline — data akan disinkronkan saat koneksi kembali
        </div>
      )}

      {/* School Filter */}
      {!loading && summary?.schools && summary.schools.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scroll-track-dark">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex-shrink-0">Filter Sekolah:</span>
          <button
            onClick={() => setSelectedSchool("all")}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap flex-shrink-0",
              selectedSchool === "all"
                ? "bg-green-600 text-white shadow-sm"
                : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-green-400"
            )}
          >
            Semua Sekolah
          </button>
          {summary.schools.map((school) => (
            <button
              key={school.school_name}
              onClick={() => setSelectedSchool(school.school_name)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap flex-shrink-0",
                selectedSchool === school.school_name
                  ? "bg-green-600 text-white shadow-sm"
                  : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-green-400"
              )}
            >
              {school.school_name}
              <span className={cn(
                "ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold",
                selectedSchool === school.school_name
                  ? "bg-white/20 text-white"
                  : "bg-slate-100 dark:bg-slate-700 text-slate-500"
              )}>
                {school.total_students}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => <StatSkeleton key={i} />)
          : STAT_CARDS.map((card, i) => (
              <StatCard
                key={card.label}
                card={card}
                value={statValues[i]}
                change={statChanges[i]}
                changeDir={statDirs[i]}
                href={statHrefs[i]}
                note={statNotes[i]}
              />
            ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* Summary Table */}
        <Card className={`${B} lg:col-span-3 overflow-hidden`}>
          <div className={BH}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-green-500" />
                <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                  Ringkasan per Kelas
                  {selectedSchool !== "all" && (
                    <span className="ml-2 text-xs font-normal text-green-600 dark:text-green-400">
                      — {selectedSchool}
                    </span>
                  )}
                </h2>
              </div>
              <Link href="/siswa">
                <Button variant="ghost" size="sm" className="text-green-600 dark:text-green-400 text-xs font-semibold h-8 px-2">
                  Lihat Detail <ChevronRight className="h-3.5 w-3.5 ml-1" />
                </Button>
              </Link>
            </div>
          </div>
          <CardContent className="p-0">
            <div className={`grid grid-cols-12 gap-3 px-5 py-2.5 ${TH}`}>
              {selectedSchool === "all" && <div className="col-span-4">Sekolah / Kelas</div>}
              {selectedSchool === "all" ? (
                <div className="col-span-2 text-center">Total</div>
              ) : (
                <div className="col-span-3 text-center">Kelas</div>
              )}
              {selectedSchool === "all" ? (
                <div className="col-span-2 text-center">Diperiksa</div>
              ) : (
                <div className="col-span-2 text-center">Total</div>
              )}
              <div className={selectedSchool === "all" ? "col-span-2 text-center" : "col-span-2 text-center"}>Normal</div>
              <div className={selectedSchool === "all" ? "col-span-2 text-center" : "col-span-2 text-center"}>Status</div>
            </div>

            {loading ? (
              <div className="px-5 py-3 space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-9 w-full rounded-lg" />
                ))}
              </div>
            ) : summary?.classes && summary.classes.length > 0 ? (
              (() => {
                const filteredClasses = selectedSchool === "all"
                  ? summary.classes
                  : summary.classes.filter(c => c.school_name === selectedSchool);
                return filteredClasses.length > 0 ? (
                  <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
                    {filteredClasses.slice(0, 8).map((cls) => (
                      <Link key={`${cls.school_name}::${cls.class_name}`} href={`/laporan?class=${encodeURIComponent(cls.class_name)}`}>
                        <div className="grid grid-cols-12 gap-3 px-5 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer items-center">
                          {selectedSchool === "all" && (
                            <div className="col-span-4 flex items-center gap-2">
                              <div className="w-7 h-7 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-xs font-bold text-green-600 dark:text-green-400 flex-shrink-0">
                                {cls.school_name.charAt(0)}
                              </div>
                              <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 truncate">{cls.school_name} / {cls.class_name}</span>
                            </div>
                          )}
                          {selectedSchool !== "all" && (
                            <div className="col-span-3">
                              <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{cls.class_name}</span>
                            </div>
                          )}
                          <div className={selectedSchool === "all" ? "col-span-2 text-center" : "col-span-2 text-center"}>
                            <span className="text-sm font-bold text-slate-600 dark:text-slate-300">{cls.total_students}</span>
                          </div>
                          <div className={selectedSchool === "all" ? "col-span-2 text-center" : "col-span-2 text-center"}>
                            <span className="text-sm font-bold text-slate-600 dark:text-slate-300">{cls.measured}</span>
                            <span className="text-xs text-slate-400 dark:text-slate-500">/{cls.total_students}</span>
                          </div>
                          <div className={selectedSchool === "all" ? "col-span-2 text-center" : "col-span-2 text-center"}>
                            <span className={`text-sm font-bold ${
                              cls.normal_percent >= 70 ? "text-green-600 dark:text-green-400"
                                : cls.normal_percent >= 40 ? "text-amber-600 dark:text-amber-400"
                                : "text-red-600 dark:text-red-400"
                            }`}>{cls.normal_percent}%</span>
                          </div>
                          <div className={selectedSchool === "all" ? "col-span-2 flex justify-center" : "col-span-2 flex justify-center"}>
                            <Badge variant={cls.status === "Normal" ? "normal" : cls.status === "Belum Diperiksa" ? "secondary" : STATUS_BADGE[cls.status] || "info"} className="text-xs">
                              {cls.status}
                            </Badge>
                          </div>
                        </div>
                      </Link>
                    ))}
                    {filteredClasses.length > 8 && (
                      <div className="px-5 py-2.5 text-center">
                        <Link href="/siswa">
                          <Button variant="ghost" size="sm" className="text-xs text-slate-500">
                            + {filteredClasses.length - 8} kelas lainnya <ChevronRight className="h-3 w-3 ml-1" />
                          </Button>
                        </Link>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="py-8 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 space-y-2">
                    <Target className="h-6 w-6 opacity-30" />
                    <p className="text-sm">Belum ada data</p>
                  </div>
                );
              })()
            ) : (
              <div className="py-8 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 space-y-2">
                <Target className="h-6 w-6 opacity-30" />
                <p className="text-sm">Belum ada data kelas</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Donut Chart */}
        <Card className={`${B} lg:col-span-2 overflow-hidden`}>
          <div className={BH}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                  Status Gizi
                  {selectedSchool !== "all" && (
                    <span className="ml-2 text-xs font-normal text-green-600 dark:text-green-400">
                      — {selectedSchool}
                    </span>
                  )}
                </h2>
              </div>
            </div>
          </div>
          <CardContent className="p-5 flex flex-col items-center">
            {loading ? (
              <Skeleton className="w-40 h-40 rounded-full" />
            ) : chartData.length > 0 ? (
              <>
                <div className="relative">
                  <ResponsiveContainer width={160} height={160}>
                    <PieChart>
                      <Pie data={chartData} cx="50%" cy="50%" innerRadius={48} outerRadius={72}
                        paddingAngle={3} dataKey="value" strokeWidth={0}>
                        {chartData.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                      </Pie>
                      <Tooltip contentStyle={{ borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 12 }} formatter={(v) => [`${v} siswa`]} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-black text-slate-800 dark:text-slate-100 leading-none">{completedPercent}%</span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Normal</span>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-y-1.5 mt-3 w-full">
                  {chartData.map((entry) => (
                    <div key={entry.name} className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: entry.color }} />
                      <span className="text-xs text-slate-600 dark:text-slate-300 truncate">{entry.name}</span>
                      <span className="text-xs font-bold text-slate-500 dark:text-slate-400 ml-auto">{entry.value}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="py-8 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 space-y-2">
                <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 opacity-30" />
                </div>
                <p className="text-xs">Belum ada data</p>
                {authed && (
                  <Link href="/pemeriksaan">
                    <Button variant="outline" size="sm" className="text-xs h-7">Mulai</Button>
                  </Link>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent History */}
      <Card className={`${B} overflow-hidden`}>
        <div className={BH}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-slate-500 dark:text-slate-400" />
              <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100">Terbaru</h2>
              {recent.length > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-bold">
                  {recent.length}
                </span>
              )}
            </div>
            <Link href="/laporan">
              <Button variant="ghost" size="sm" className="text-green-600 dark:text-green-400 text-xs font-semibold h-8 px-2">
                Semua <ChevronRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            </Link>
          </div>
        </div>

        <CardContent className="p-0">
          {loading ? (
            <div className="p-4 space-y-2">
              {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-10 w-full rounded-lg" />)}
            </div>
          ) : filteredMeasurements.length > 0 ? (
            <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
              {filteredMeasurements.slice(0, 5).map((m) => (
                <Link key={m.id} href={`/laporan?student=${m.student_name}`}
                  className="flex items-center px-5 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                  <div className={`w-2 h-2 rounded-full mr-3 flex-shrink-0 ${
                    m.status_category === "Normal" ? "bg-green-500" : "bg-amber-500"
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 truncate">{m.student_name}</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500">{m.student_class} &middot; {formatDateTime(m.checked_at)}</p>
                  </div>
                  <div className="hidden sm:flex items-center gap-4 mr-3">
                    <span className="text-xs text-slate-500">{m.height} cm</span>
                    <span className="text-xs text-slate-500">{m.weight} kg</span>
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-300">IMT {typeof m.bmi === "number" ? m.bmi.toFixed(1) : parseFloat(m.bmi).toFixed(1)}</span>
                  </div>
                  <Badge variant={STATUS_BADGE[m.status_category] || "info"} className="text-xs mr-1">
                    {m.status_category}
                  </Badge>
                  <ChevronRight className="h-4 w-4 text-slate-300 dark:text-slate-600 group-hover:text-green-500 transition-colors" />
                </Link>
              ))}
            </div>
          ) : (
            <div className="py-8 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 space-y-2">
              <ClipboardCheck className="h-6 w-6 opacity-30" />
              <p className="text-sm">Belum ada pemeriksaan</p>
              {authed && (
                <Link href="/pemeriksaan">
                  <Button variant="outline" size="sm" className="text-xs h-8">
                    Mulai <ArrowRight className="h-3.5 w-3.5 ml-1" />
                  </Button>
                </Link>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
