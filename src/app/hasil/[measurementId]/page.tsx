"use client";

import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { Printer, Stethoscope, Share2, Copy, Check } from "lucide-react";
import QRCode from "react-qr-code";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn, calculateAgeYears, formatDate } from "@/lib/utils";

interface MeasurementDetail {
  id: number;
  student_name: string;
  student_nis: string;
  student_class: string;
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
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  normal: { label: "Normal", color: "text-green-700 dark:text-green-400", bg: "bg-green-50 dark:bg-green-900/30 dark:bg-green-900/30 border-green-200 dark:border-green-800" },
  overweight: { label: "Overweight", color: "text-amber-700 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-900/30 border-amber-200 dark:border-amber-800" },
  obesitas: { label: "Obesitas", color: "text-red-700 dark:text-red-400", bg: "bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800" },
  stunting: { label: "Stunting", color: "text-orange-700 dark:text-orange-400", bg: "bg-orange-50 dark:bg-orange-900/30 border-orange-200 dark:border-orange-800" },
  severely_stunting: { label: "Stunting Berat", color: "text-orange-800 dark:text-orange-300", bg: "bg-orange-100 dark:bg-orange-900/50 border-orange-300 dark:border-orange-700" },
  secondary: { label: "-", color: "text-slate-700 dark:text-slate-300", bg: "bg-slate-50 dark:bg-slate-800 dark:bg-slate-800 border-slate-200 dark:border-slate-700" },
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
              setData({
                id: -1,
                student_name: last.student_name || last.student?.full_name || "-",
                student_nis: last.student?.nis || "-",
                student_class: last.class_name || last.student?.class_name || "-",
                student_gender: last.student?.gender || "-",
                student_birth_date: last.student?.birth_date || "-",
                parent_name: last.student?.parent_name || "-",
                height: last.height,
                weight: last.weight,
                bmi: last.bmi,
                z_score: 0,
                status: last.status_category || last.status || "-",
                status_variant: "secondary",
                bg_color: "bg-slate-50 dark:bg-slate-800",
                recommendation: "Data tersimpan offline. Hasil final akan tersedia setelah sinkronisasi.",
                notes: last.notes || "",
                checked_at: last.saved_at,
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

  const statusCfg = data ? STATUS_CONFIG[data.status_variant] : null;

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
                <Badge variant={data.status_variant} className="text-base px-4 py-1">
                  {data.status}
                </Badge>
              </div>
            </div>

            {/* Recommendation */}
            <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 mb-4">
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                Saran & Rekomendasi
              </p>
              <p className="text-sm text-slate-700 leading-relaxed">
                {data.recommendation}
              </p>
            </div>

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
          Project Gizi &mdash; Platform Pemantauan Status Gizi Siswa
        </p>
      </div>
    </div>
  );
}
