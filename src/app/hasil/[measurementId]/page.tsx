"use client";

import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { Printer, Stethoscope, Share2, Copy, Check, TrendingUp, TrendingDown, Minus, History } from "lucide-react";
import QRCode from "react-qr-code";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn, calculateAgeYears, formatDate } from "@/lib/utils";

interface MeasurementDetail {
  id: number;
  student_id: number;
  student_name: string;
  student_nis: string;
  student_class: string;
  student_school_name: string;
  student_gender: string;
  student_birth_date: string;
  parent_name: string;
  height: number;
  weight: number;
  bmi: number;
  z_score: number;
  status: string;
  status_variant: "normal" | "obesitas" | "overweight" | "stunting" | "severely_stunting" | "secondary";
  bg_color: string;
  recommendation: string;
  notes: string;
  checked_at: string;
  history: HistoryItem[];
}

interface HistoryItem {
  id: number;
  height: number;
  weight: number;
  bmi: number;
  z_score: number;
  status: string;
  notes: string;
  checked_at: string;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  normal: { label: "Normal", color: "text-green-700 dark:text-green-400", bg: "bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-800" },
  overweight: { label: "Overweight", color: "text-amber-700 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-900/30 border-amber-200 dark:border-amber-800" },
  obesitas: { label: "Obesitas", color: "text-red-700 dark:text-red-400", bg: "bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800" },
  stunting: { label: "Stunting", color: "text-orange-700 dark:text-orange-400", bg: "bg-orange-50 dark:bg-orange-900/30 border-orange-200 dark:border-orange-800" },
  severely_stunting: { label: "Stunting Berat", color: "text-orange-800 dark:text-orange-300", bg: "bg-orange-100 dark:bg-orange-900/50 border-orange-300 dark:border-orange-700" },
  secondary: { label: "-", color: "text-slate-700 dark:text-slate-300", bg: "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700" },
};

const RECOMMENDATIONS: Record<string, string> = {
  Normal: "Kondisi gizi anak ini baik dan sesuai dengan standar WHO 2007. Pertahankan pola makan seimbang dan aktivitas fisik teratur.",
  Overweight: "Perlu perhatian khusus. Disarankan untuk meningkatkan aktivitas fisik dan mengurangi makanan tinggi gula dan lemak.",
  Obesitas: "Anak mengalami obesitas yang memerlukan penanganan segera. Segera konsultasikan ke dokter atau ahli gizi untuk rencana diet dan olahraga yang sesuai.",
  Stunting: "Anak mengalami stunting. Perbaiki asupan gizi dengan memperbanyak makanan kaya protein, zat besi, dan zinc.",
  "Stunting Berat": "Kondisi stunting berat memerlukan intervensi segera. Segera konsultasikan ke dokter dan ahli gizi.",
};

const getStatusVariant = (status: string): MeasurementDetail["status_variant"] => {
  const map: Record<string, MeasurementDetail["status_variant"]> = {
    Normal: "normal",
    Overweight: "overweight",
    Obesitas: "obesitas",
    Stunting: "stunting",
    "Stunting Berat": "severely_stunting",
  };
  return map[status] || "secondary";
};

const getBgColor = (status: string): string => {
  const map: Record<string, string> = {
    Normal: "bg-green-50 dark:bg-green-900/30",
    Overweight: "bg-amber-50 dark:bg-amber-900/30",
    Obesitas: "bg-red-50 dark:bg-red-900/30",
    Stunting: "bg-orange-50 dark:bg-orange-900/30",
    "Stunting Berat": "bg-orange-100 dark:bg-orange-900/50",
  };
  return map[status] || "bg-slate-50 dark:bg-slate-800";
};

const getTrend = (current: number, prev: number): "up" | "down" | "stable" => {
  const diff = current - prev;
  if (Math.abs(diff) < 0.1) return "stable";
  return diff > 0 ? "up" : "down";
};

export default function ResultPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const id = params.measurementId as string;
  const isPdfMode = searchParams.get("pdf") === "1";

  const [data, setData] = useState<MeasurementDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const getBaseUrl = () => {
    if (typeof window !== "undefined") {
      const origin = window.location.origin;
      // If accessing via localhost from a different device, use the hostname directly
      // so the QR code works across devices on the same network
      return origin;
    }
    return "http://localhost:3000";
  };

  const qrUrl = `${getBaseUrl()}/hasil/${id}`;

  useEffect(() => {
    const fetchResult = async () => {
      try {
        const res = await fetch(`/api/measurements/${id}`);
        if (res.ok) {
          setData(await res.json());
        }
      } catch {
        // fallback - try offline data
        const pending = localStorage.getItem("pending_measurements");
        if (pending) {
          try {
            const arr = JSON.parse(pending);
            if (Array.isArray(arr) && arr.length > 0) {
              const last = arr[arr.length - 1];
              const status = last.status_category || last.status || "-";
              setData({
                id: -1,
                student_id: 0,
                student_name: last.student_name || last.student?.full_name || "-",
                student_nis: last.student?.nis || "-",
                student_class: last.class_name || last.student?.class_name || "-",
                student_school_name: last.student?.school_name || "SD / MI / SMP / SMA Negeri",
                student_gender: last.student?.gender || "-",
                student_birth_date: last.student?.birth_date || "-",
                parent_name: last.student?.parent_name || "-",
                height: last.height,
                weight: last.weight,
                bmi: last.bmi,
                z_score: 0,
                status,
                status_variant: getStatusVariant(status),
                bg_color: "bg-slate-50 dark:bg-slate-800",
                recommendation: "Data tersimpan offline. Hasil final akan tersedia setelah sinkronisasi.",
                notes: last.notes || "",
                checked_at: last.saved_at,
                history: [],
              });
            }
          } catch {
            // ignore
          }
        }
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchResult();
  }, [id]);

  const handleCopy = () => {
    navigator.clipboard.writeText(qrUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Hasil Pemeriksaan Gizi - ${data?.student_name}`,
          text: `Hasil pemeriksaan status gizi ${data?.student_name} (${data?.student_class})`,
          url: qrUrl,
        });
      } catch {
        // User cancelled or share failed - fall back to copy
        handleCopy();
      }
    } else {
      handleCopy();
    }
  };

  const statusCfg = data ? STATUS_CONFIG[data.status] : null;

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-800 flex items-center justify-center">
        <div className="w-full max-w-2xl mx-auto p-6 space-y-4">
          <Skeleton className="h-8 w-1/2 mx-auto" />
          <Skeleton className="h-64 w-full rounded-2xl" />
          <Skeleton className="h-24 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-800 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Stethoscope className="h-16 w-16 text-slate-300 dark:text-slate-600 mx-auto" />
          <h1 className="text-xl font-bold text-slate-600 dark:text-slate-300">
            Hasil tidak ditemukan
          </h1>
          <p className="text-sm text-slate-400 ">
            QR Code mungkin sudah kadaluarsa atau data tidak tersedia
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-700">
      {/* Toolbar (only show when not printing) */}
      {!isPdfMode && (
        <div className="sticky top-0 z-10 bg-white dark:bg-slate-800 border-b border-slate-200 px-4 py-3 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
            <div className="w-5 h-5 rounded overflow-hidden">
              <img src="/logo-mbg.webp" alt="MBG" className="w-full h-full object-contain" />
            </div>
            <span className="font-semibold">MBG</span>
            <span className="text-slate-300 dark:text-slate-600">|</span>
            <span>Lembar Hasil</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => window.print()}>
              <Printer className="h-4 w-4" />
              Cetak / Simpan PDF
            </Button>
          </div>
        </div>
      )}

      {/* Printable Content */}
      <div className="max-w-2xl mx-auto p-4 sm:p-8">
        <div
          id="print-area"
          className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg overflow-hidden print:shadow-none print:border-0 print:rounded-none print:m-0"
          style={{ fontFamily: "Nunito, system-ui, sans-serif" }}
        >
          {/* Header */}
          <div className="bg-green-600 text-white px-8 py-6 text-center">
            <div className="flex items-center justify-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800/20 flex items-center justify-center overflow-hidden">
                <img src="/logo-mbg.webp" alt="MBG" className="w-full h-full object-contain" />
              </div>
              <div>
                <h1 className="text-xl font-extrabold">LEMBAR HASIL PEMERIKSAAN GIZI</h1>
                <p className="text-xs text-green-200">
                  Pemantauan Status Gizi Berbasis MBG &amp; WHO 2007
                </p>
              </div>
            </div>
          </div>

          {/* Student Info */}
          <div className="px-8 py-6 border-b border-slate-100">
            <h2 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
              Identitas Siswa
            </h2>
            <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
              <div>
                <span className="text-slate-400 ">Nama</span>
                <p className="font-bold text-slate-800 dark:text-slate-200">{data.student_name}</p>
              </div>
              <div>
                <span className="text-slate-400 ">NIS</span>
                <p className="font-bold text-slate-800 dark:text-slate-200">{data.student_nis}</p>
              </div>
              <div>
                <span className="text-slate-400 ">Kelas</span>
                <p className="font-bold text-slate-800 dark:text-slate-200">{data.student_class}</p>
              </div>
              <div>
                <span className="text-slate-400 ">Jenis Kelamin</span>
                <p className="font-bold text-slate-800 dark:text-slate-200">
                  {data.student_gender === "L" ? "Laki-laki" : "Perempuan"}
                </p>
              </div>
              <div>
                <span className="text-slate-400 ">Tanggal Lahir</span>
                <p className="font-bold text-slate-800 dark:text-slate-200">
                  {formatDate(data.student_birth_date)}
                </p>
              </div>
              <div>
                <span className="text-slate-400 ">Umur</span>
                <p className="font-bold text-slate-800 dark:text-slate-200">
                  {calculateAgeYears(data.student_birth_date)}
                </p>
              </div>
              <div>
                <span className="text-slate-400 ">Asal Sekolah</span>
                <p className="font-bold text-slate-800 dark:text-slate-200">
                  {data.student_school_name || "SD / MI / SMP / SMA Negeri"}
                </p>
              </div>
            </div>
          </div>

          {/* Measurement Data */}
          <div className="px-8 py-6 border-b border-slate-100">
            <h2 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
              Data Pemeriksaan
            </h2>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="text-center p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200">
                <p className="text-slate-400  text-xs">Tinggi Badan</p>
                <p className="text-xl font-extrabold text-slate-800 dark:text-slate-200">
                  {data.height}
                </p>
                <p className="text-xs text-slate-400 ">cm</p>
              </div>
              <div className="text-center p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200">
                <p className="text-slate-400  text-xs">Berat Badan</p>
                <p className="text-xl font-extrabold text-slate-800 dark:text-slate-200">
                  {data.weight}
                </p>
                <p className="text-xs text-slate-400 ">kg</p>
              </div>
              <div className="text-center p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200">
                <p className="text-slate-400  text-xs">Tanggal Periksa</p>
                <p className="text-sm font-extrabold text-slate-800 dark:text-slate-200">
                  {formatDate(data.checked_at)}
                </p>
              </div>
            </div>
          </div>

          {/* Result */}
          <div className="px-8 py-6">
            <h2 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
              Hasil Analisis Gizi
            </h2>
            <div
              className={cn(
                "rounded-2xl border-2 p-6 text-center mb-4",
                statusCfg?.bg
              )}
            >
              <div className="grid grid-cols-2 gap-6 mb-4">
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Indeks Massa Tubuh (IMT)</p>
                  <p className="text-4xl font-extrabold">{data.bmi.toFixed(1)}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Z-Score (BMI/Age)</p>
                  <p className="text-4xl font-extrabold">
                    {data.z_score > 0 ? "+" : ""}{data.z_score.toFixed(2)}
                  </p>
                </div>
              </div>
              <div>
                <Badge variant={getStatusVariant(data.status)} className="text-base px-4 py-1">
                  {data.status}
                </Badge>
              </div>
            </div>

            {/* Recommendation */}
            <div className={cn(
              "rounded-2xl border-2 p-5 mb-4",
              data.status === "Normal"
                ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
                : data.status === "Obesitas"
                ? "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
                : data.status === "Overweight"
                ? "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800"
                : data.status === "Stunting" || data.status === "Stunting Berat"
                ? "bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800"
                : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
            )}>
              <p className={cn(
                "text-xs font-bold uppercase tracking-wider mb-2",
                data.status === "Normal"
                  ? "text-green-700 dark:text-green-400"
                  : data.status === "Obesitas"
                  ? "text-red-700 dark:text-red-400"
                  : data.status === "Overweight"
                  ? "text-amber-700 dark:text-amber-400"
                  : data.status === "Stunting" || data.status === "Stunting Berat"
                  ? "text-orange-700 dark:text-orange-400"
                  : "text-slate-500 dark:text-slate-400"
              )}>
                Saran & Rekomendasi
              </p>
              <p className={cn(
                "text-sm font-semibold leading-relaxed",
                data.status === "Normal"
                  ? "text-green-800 dark:text-green-300"
                  : data.status === "Obesitas"
                  ? "text-red-800 dark:text-red-300"
                  : data.status === "Overweight"
                  ? "text-amber-800 dark:text-amber-300"
                  : data.status === "Stunting" || data.status === "Stunting Berat"
                  ? "text-orange-800 dark:text-orange-300"
                  : "text-slate-700 dark:text-slate-300"
              )}>
                {data.recommendation || RECOMMENDATIONS[data.status] || "Silakan konsultasikan hasil ini dengan tenaga kesehatan."}
              </p>
            </div>

            {/* Riwayat Perkembangan */}
            {data.history && data.history.length > 1 && (
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-3">
                  <History className="h-4 w-4 text-green-500" />
                  <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Riwayat Perkembangan
                  </p>
                  <span className="px-1.5 py-0.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-[10px] font-bold">
                    {data.history.length}x pemeriksaan
                  </span>
                </div>

                <div className="space-y-2">
                  {data.history.map((h, i) => {
                    const trend = getTrend(h.bmi, (data.history[i + 1]?.bmi ?? h.bmi));
                    const isCurrent = h.id === data.id;
                    const cfg = STATUS_CONFIG[h.status] || STATUS_CONFIG.secondary;

                    return (
                      <div
                        key={h.id}
                        className={cn(
                          "flex items-center gap-3 p-3 rounded-xl border transition-colors",
                          isCurrent
                            ? `${cfg.bg} border-current/20`
                            : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                        )}
                      >
                        {/* Timeline dot */}
                        <div className="flex flex-col items-center flex-shrink-0">
                          <div className={cn(
                            "w-2.5 h-2.5 rounded-full",
                            cfg.bg.replace("bg-", "bg-").split(" ")[0]
                          )} style={{ backgroundColor: cfg.bg.includes("green") ? "#16a34a" : cfg.bg.includes("amber") ? "#f59e0b" : cfg.bg.includes("red") ? "#dc2626" : cfg.bg.includes("orange") ? "#ea580c" : "#94a3b8" }} />
                          {i < data.history.length - 1 && <div className="w-0.5 flex-1 bg-slate-200 dark:bg-slate-700 mt-1" style={{ minHeight: "12px" }} />}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-xs text-slate-400 dark:text-slate-500">
                              {formatDate(h.checked_at)}
                              {isCurrent && <span className="ml-2 font-bold text-green-600 dark:text-green-400">Terbaru</span>}
                            </p>
                            <Badge variant={getStatusVariant(h.status)} className="text-[10px] px-1.5 py-0">
                              {h.status}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-xs">
                            <div>
                              <span className="text-slate-400">TB </span>
                              <span className="font-bold text-slate-700 dark:text-slate-200">{h.height} cm</span>
                            </div>
                            <div>
                              <span className="text-slate-400">BB </span>
                              <span className="font-bold text-slate-700 dark:text-slate-200">{h.weight} kg</span>
                            </div>
                            <div>
                              <span className="text-slate-400">IMT </span>
                              <span className="font-bold text-slate-700 dark:text-slate-200">{h.bmi.toFixed(1)}</span>
                              {!isCurrent && i < data.history.length - 1 && (
                                <span className={cn(
                                  "ml-1",
                                  trend === "up" ? "text-red-500" : trend === "down" ? "text-green-500" : "text-slate-400"
                                )}>
                                  {trend === "up" ? <TrendingUp className="h-3 w-3 inline" />
                                    : trend === "down" ? <TrendingDown className="h-3 w-3 inline" />
                                    : <Minus className="h-3 w-3 inline" />}
                                </span>
                              )}
                            </div>
                          </div>
                          {h.notes && (
                            <p className="text-[10px] text-slate-400 mt-1 italic">Catatan: {h.notes}</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* QR Code & Share */}
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-5 mb-4 border border-blue-100 dark:border-blue-800 print:hidden">
              <p className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-3">
                Bagikan Hasil
              </p>
              <div className="flex items-center gap-4">
                <div className="flex flex-col items-center gap-2">
                  <div className="p-3 bg-white rounded-xl border border-slate-200 dark:border-slate-600 shadow-sm">
                    <QRCode
                      value={qrUrl}
                      size={100}
                      bgColor="#ffffff"
                      fgColor="#1e293b"
                    />
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 text-center leading-tight">
                    Scan untuk<br />melihat hasil
                  </p>
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={qrUrl}
                      className="flex-1 h-10 px-3 rounded-xl border border-slate-300 bg-white dark:bg-slate-800 dark:border-slate-600 text-xs text-slate-600 dark:text-slate-300 truncate"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCopy}
                      className="flex-shrink-0 h-10 px-3"
                    >
                      {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleShare}
                    className="w-full h-9 text-xs"
                  >
                    <Share2 className="h-4 w-4" />
                    Bagikan Hasil
                  </Button>
                  <p className="text-xs text-slate-400 dark:text-slate-500 leading-tight">
                    Siswa/orang tua dapat membuka link ini untuk melihat hasil pemeriksaan secara online.
                  </p>
                </div>
              </div>
            </div>

            {/* Notes */}
            {data.notes && (
              <div className="bg-amber-50 rounded-xl p-4 mb-4 border border-amber-200">
                <p className="text-xs font-bold text-amber-600 uppercase tracking-wider mb-1">
                  Catatan Petugas
                </p>
                <p className="text-sm text-slate-700">{data.notes}</p>
              </div>
            )}

            {/* Footer */}
            <div className="flex items-end justify-between pt-4 border-t border-slate-100">
              <div className="text-xs text-slate-400 ">
                <p>Dicetak: {formatDate(new Date().toISOString(), "dd MMMM yyyy, HH:mm")}</p>
                <p className="mt-1">
                  Standar: WHO Growth Reference 2007 (5-19 tahun)
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-400  mb-8">Petugas UKS</p>
                <div className="w-32 border-b border-slate-300 mx-auto" />
              </div>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-slate-400  mt-4">
          Monitoring Gizi &mdash; Platform Pemantauan Status Gizi Siswa
        </p>
      </div>
    </div>
  );
}
