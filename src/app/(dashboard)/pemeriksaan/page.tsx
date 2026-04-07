"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  UserCheck,
  Ruler,
  Scale,
  Calculator,
  Save,
  Download,
  ChevronRight,
  ChevronLeft,
  Check,
  Plus,
  Loader2,
  Stethoscope,
} from "lucide-react";
import QRCode from "react-qr-code";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogFooter } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { cn, calculateAgeYears, formatDate } from "@/lib/utils";

interface Student {
  id: number;
  nis: string;
  full_name: string;
  gender: "L" | "P";
  birth_date: string;
  class_name: string;
  parent_name: string;
}

interface MeasurementResult {
  bmi: number;
  zScore: number;
  status: string;
  statusVariant: "normal" | "obesitas" | "overweight" | "stunting" | "severely_stunting" | "secondary";
  color: string;
  bgColor: string;
  recommendation: string;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  normal: { label: "Normal", color: "text-green-700", bg: "bg-green-50 border-green-200" },
  overweight: { label: "Overweight", color: "text-amber-700", bg: "bg-amber-50 border-amber-200" },
  obesitas: { label: "Obesitas", color: "text-red-700", bg: "bg-red-50 border-red-200" },
  stunting: { label: "Stunting", color: "text-orange-700", bg: "bg-orange-50 border-orange-200" },
  severely_stunting: { label: "Stunting Berat", color: "text-orange-800", bg: "bg-orange-100 border-orange-300" },
};

export default function PemeriksaanPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [students, setStudents] = useState<Student[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [calculating, setCalculating] = useState(false);
  const [result, setResult] = useState<MeasurementResult | null>(null);
  const [measurementId, setMeasurementId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [newStudent, setNewStudent] = useState({
    nis: "",
    full_name: "",
    gender: "L",
    birth_date: "",
    class_name: "",
  });
  const [addingStudent, setAddingStudent] = useState(false);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await fetch("/api/students", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
          },
        });
        if (res.ok) {
          const data = await res.json();
          setStudents(data);
          setFilteredStudents(data);
        }
      } catch {
        setStudents([]);
        setFilteredStudents([]);
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, []);

  useEffect(() => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      setFilteredStudents(
        students.filter(
          (s) =>
            s.full_name.toLowerCase().includes(q) ||
            s.nis.toLowerCase().includes(q)
        )
      );
    } else {
      setFilteredStudents(students);
    }
  }, [searchQuery, students]);

  const handleAddStudent = async () => {
    if (!newStudent.nis || !newStudent.full_name || !newStudent.birth_date || !newStudent.class_name) {
      toast.error("Lengkapi semua field wajib");
      return;
    }
    setAddingStudent(true);
    try {
      const res = await fetch("/api/students", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
        body: JSON.stringify(newStudent),
      });
      if (res.ok) {
        const created = await res.json();
        setStudents([...students, created]);
        setFilteredStudents([...students, created]);
        setSelectedStudent(created);
        setAddModalOpen(false);
        setNewStudent({ nis: "", full_name: "", gender: "L", birth_date: "", class_name: "" });
        toast.success(`Siswa "${created.full_name}" ditambahkan`);
        setStep(2);
      } else {
        toast.error("Gagal menambahkan siswa");
      }
    } catch {
      toast.error("Terjadi kesalahan");
    } finally {
      setAddingStudent(false);
    }
  };

  const calculateStatus = async () => {
    if (!selectedStudent || !height || !weight) return;

    const h = parseFloat(height);
    const w = parseFloat(weight);

    if (h < 50 || h > 250 || w < 3 || w > 200) {
      toast.error("Nilai tinggi/berat di luar jangkauan normal");
      return;
    }

    setCalculating(true);
    setResult(null);

    // Simulate brief calculation
    await new Promise((r) => setTimeout(r, 1500));

    try {
      const res = await fetch("/api/calculate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
        body: JSON.stringify({
          student_id: selectedStudent.id,
          height: h,
          weight: w,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setResult(data);
        setStep(3);
      } else {
        toast.error("Gagal menghitung status gizi");
      }
    } catch {
      toast.error("Terjadi kesalahan koneksi");
    } finally {
      setCalculating(false);
    }
  };

  // Sync pending measurements when back online
  const syncPending = async () => {
    const pending = JSON.parse(localStorage.getItem("pending_measurements") || "[]");
    if (pending.length === 0) return;

    try {
      const res = await fetch("/api/measurements/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pending }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.synced > 0) {
          // Remove synced items from pending
          const failedIds = data.results
            .filter((r: { success: boolean }) => !r.success)
            .map((r: { id: string }) => r.id);
          const remaining = pending.filter(
            (p: { id: string }) => failedIds.includes(p.id)
          );
          localStorage.setItem("pending_measurements", JSON.stringify(remaining));
          toast.success(`${data.synced} data berhasil disinkronkan`);
        } else {
          toast.error("Sinkronisasi gagal");
        }
      }
    } catch {
      // Still offline, do nothing
    }
  };

  // Auto-sync when coming back online
  useEffect(() => {
    const handleOnline = () => syncPending();
    window.addEventListener("online", handleOnline);
    // Try sync immediately
    syncPending();
    return () => window.removeEventListener("online", handleOnline);
  }, []);

  // Check for pending on mount
  useEffect(() => {
    const pending = JSON.parse(localStorage.getItem("pending_measurements") || "[]");
    if (pending.length > 0) {
      toast.info(`${pending.length} data menunggu sinkronisasi`);
    }
  }, []);

  const handleSave = async () => {
    if (!selectedStudent || !result || !height || !weight) return;
    setSaving(true);

    try {
      const res = await fetch("/api/measurements", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
        body: JSON.stringify({
          student_id: selectedStudent.id,
          height: parseFloat(height),
          weight: parseFloat(weight),
          bmi: result.bmi,
          status_category: result.status,
          notes,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setMeasurementId(data.id);
        toast.success("Data pemeriksaan berhasil disimpan");
        // Try to sync any pending while online
        syncPending();
      } else {
        const data = await res.json();
        toast.error(data.error || "Gagal menyimpan data");
        throw new Error("Save failed");
      }
    } catch {
      // Save offline
      const offlineData = {
        id: `offline_${Date.now()}_${Math.random().toString(36).slice(2)}`,
        student_id: selectedStudent.id,
        student_name: selectedStudent.full_name,
        class_name: selectedStudent.class_name,
        height: parseFloat(height),
        weight: parseFloat(weight),
        bmi: result.bmi,
        status_category: result.status,
        z_score: result.zScore.toString(),
        notes,
        saved_at: new Date().toISOString(),
      };
      const existing = JSON.parse(localStorage.getItem("pending_measurements") || "[]");
      existing.push(offlineData);
      localStorage.setItem("pending_measurements", JSON.stringify(existing));
      toast.warning("Tersimpan offline. Akan disinkronkan saat online.", {
        description: `${existing.length} data menunggu sinkronisasi`,
      });
      setMeasurementId(-1);
    } finally {
      setSaving(false);
    }
  };

  const handleDownloadPDF = () => {
    if (!measurementId || measurementId < 0) {
      toast.error("Simpan data terlebih dahulu");
      return;
    }
    router.push(`/hasil/${measurementId}?pdf=1`);
  };

  const stepLabels = ["Pilih Siswa", "Input Ukuran", "Hasil"];
  const statusCfg = result ? STATUS_CONFIG[result.statusVariant] : null;

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-800 dark:text-white">
          Pemeriksaan Gizi
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-300 mt-0.5">
          Ikuti langkah-langkah di bawah untuk memeriksa status gizi siswa
        </p>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center gap-0">
        {stepLabels.map((label, i) => {
          const num = i + 1;
          const isActive = num === step;
          const isDone = num < step;
          return (
            <div key={i} className="flex items-center">
              <div className="flex items-center gap-2">
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all",
                    isDone
                      ? "bg-green-600 text-white"
                      : isActive
                      ? "bg-green-600 text-white shadow-lg shadow-green-200"
                      : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                  )}
                >
                  {isDone ? <Check className="h-4 w-4" /> : num}
                </div>
                <span
                  className={cn(
                    "text-sm font-semibold hidden sm:block",
                    isActive ? "text-green-600 dark:text-green-300" : isDone ? "text-green-600 dark:text-green-300" : "text-slate-500 dark:text-slate-300"
                  )}
                >
                  {label}
                </span>
              </div>
              {i < stepLabels.length - 1 && (
                <div
                  className={cn(
                    "w-12 sm:w-20 h-0.5 mx-3",
                    isDone ? "bg-green-600" : "bg-slate-200 dark:bg-slate-600"
                  )}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* === STEP 1: Select Student === */}
      {step === 1 && (
        <Card>
          <CardContent className="p-6 space-y-4">
            <div>
              <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <UserCheck className="h-5 w-5 text-green-600" />
                Pilih Siswa
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-300 mt-1">
                Cari dan pilih siswa yang akan diperiksa
              </p>
            </div>

            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 dark:text-slate-400" />
              <input
                type="text"
                placeholder="Ketik nama atau NIS siswa..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-12 w-full rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 pl-12 pr-4 text-sm text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                autoFocus
              />
            </div>

            {loading ? (
              <div className="space-y-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full rounded-xl" />
                ))}
              </div>
            ) : filteredStudents.length > 0 ? (
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {filteredStudents.map((student) => (
                  <button
                    key={student.id}
                    onClick={() => setSelectedStudent(student)}
                    className={cn(
                      "w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all",
                      selectedStudent?.id === student.id
                        ? "border-green-400 bg-green-50 dark:bg-green-900/20 dark:ring-green-700"
                        : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                    )}
                  >
                    <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/40 flex items-center justify-center text-green-700 dark:text-green-400 font-bold text-sm">
                      {student.full_name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-800 text-sm truncate">
                        {student.full_name}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {student.nis} &middot; {student.class_name}
                      </p>
                    </div>
                    {selectedStudent?.id === student.id && (
                      <Check className="h-5 w-5 text-green-600" />
                    )}
                  </button>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-slate-500 dark:text-slate-400">
                <Search className="h-8 w-8 mx-auto opacity-30 mb-2" />
                <p className="text-sm">Siswa tidak ditemukan</p>
              </div>
            )}

            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => setAddModalOpen(true)}
                className="flex items-center gap-2 text-sm font-semibold text-green-600 hover:text-green-700"
              >
                <Plus className="h-4 w-4" />
                Siswa Baru
              </button>
              <Button
                variant="primary"
                size="lg"
                disabled={!selectedStudent}
                onClick={() => setStep(2)}
              >
                Lanjut
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* === STEP 2: Input Measurements === */}
      {step === 2 && (
        <Card>
          <CardContent className="p-6 space-y-6">
            {/* Selected student info */}
            {selectedStudent && (
              <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold">
                  {selectedStudent.full_name.charAt(0)}
                </div>
                <div>
                  <p className="font-bold text-slate-800 dark:text-white text-sm">
                    {selectedStudent.full_name}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-300">
                    {selectedStudent.nis} &middot; {selectedStudent.class_name} &middot;{" "}
                    {selectedStudent.gender === "L" ? "Laki-laki" : "Perempuan"} &middot;{" "}
                    {calculateAgeYears(selectedStudent.birth_date)}
                  </p>
                </div>
                <button
                  onClick={() => setStep(1)}
                  className="ml-auto text-xs text-green-600 font-semibold hover:underline"
                >
                  Ganti
                </button>
              </div>
            )}

            <div>
              <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <Stethoscope className="h-5 w-5 text-green-600" />
                Masukkan Data Ukuran
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-300 mt-1">
                Ukur tinggi badan dan berat badan siswa, lalu masukkan nilainya
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700 dark:text-white">
                  Tinggi Badan
                </label>
                <div className="relative">
                  <input
                    type="number"
                    inputMode="decimal"
                    step="0.1"
                    min="50"
                    max="250"
                    placeholder="0.0"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    className="h-20 w-full rounded-xl border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 pl-5 pr-14 text-2xl font-bold text-slate-800 dark:text-white focus:outline-none focus:border-green-500 transition-colors"
                    autoFocus
                  />
                  <span className="absolute right-5 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-400 dark:text-slate-300">
                    cm
                  </span>
                </div>
                <p className="text-xs text-slate-400 dark:text-slate-300">Rentang: 50 - 250 cm</p>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700 dark:text-white">
                  Berat Badan
                </label>
                <div className="relative">
                  <input
                    type="number"
                    inputMode="decimal"
                    step="0.1"
                    min="3"
                    max="200"
                    placeholder="0.0"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    className="h-20 w-full rounded-xl border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 pl-5 pr-14 text-2xl font-bold text-slate-800 dark:text-white focus:outline-none focus:border-green-500 transition-colors"
                  />
                  <span className="absolute right-5 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-400 dark:text-slate-300">
                    kg
                  </span>
                </div>
                <p className="text-xs text-slate-400 dark:text-slate-300">Rentang: 3 - 200 kg</p>
              </div>
            </div>

            {/* Loading overlay */}
            {calculating && (
              <div className="flex flex-col items-center justify-center py-12 space-y-4">
                <div className="relative">
                  <div className="w-20 h-20 rounded-full border-4 border-green-100 dark:border-green-900" />
                  <div className="absolute inset-0 rounded-full border-4 border-green-600 dark:border-green-400 border-t-transparent animate-spin" />
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-slate-700 dark:text-white">
                    Menghitung...
                  </p>
                  <p className="text-sm text-slate-400 ">
                    Menganalisis data dengan standar WHO 2007
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                size="lg"
                onClick={() => setStep(1)}
                disabled={calculating}
              >
                <ChevronLeft className="h-5 w-5" />
                Kembali
              </Button>
              <Button
                variant="primary"
                size="xl"
                onClick={calculateStatus}
                loading={calculating}
                disabled={!height || !weight || calculating}
                className="px-8"
              >
                <Calculator className="h-5 w-5" />
                Hitung Status Gizi
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* === STEP 3: Results === */}
      {step === 3 && result && (
        <div className="space-y-4">
          {/* Result Card */}
          <Card>
            <CardContent className="p-6">
              {/* Student info */}
              {selectedStudent && (
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                  <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold text-lg">
                    {selectedStudent.full_name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold text-slate-800 dark:text-white">
                      {selectedStudent.full_name}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-300">
                      {selectedStudent.nis} &middot; {selectedStudent.class_name} &middot;{" "}
                      {selectedStudent.gender === "L" ? "Laki-laki" : "Perempuan"}
                    </p>
                  </div>
                  <span className="ml-auto text-xs text-slate-400 ">
                    {formatDate(new Date().toISOString())}
                  </span>
                </div>
              )}

              {/* Main result */}
              <div className="text-center py-4">
                <div
                  className={cn(
                    "inline-flex flex-col items-center p-8 rounded-2xl border-2 w-full max-w-sm mx-auto mb-6",
                    result.bgColor
                  )}
                >
                  <p className="text-sm font-semibold text-slate-500 dark:text-slate-300 mb-1">
                    IMT (BMI)
                  </p>
                  <p className="text-5xl font-extrabold mb-1">{result.bmi.toFixed(1)}</p>
                  <p className="text-sm text-slate-400 ">
                    Z-Score: {result.zScore > 0 ? "+" : ""}{result.zScore.toFixed(2)}
                  </p>
                  <div className="mt-4">
                    <span
                      className={cn(
                        "inline-flex items-center rounded-full border px-4 py-1.5 text-base font-bold uppercase tracking-wider",
                        result.statusVariant === "normal" && "bg-green-100 text-green-800 border-green-200",
                        result.statusVariant === "obesitas" && "bg-red-100 text-red-800 border-red-200",
                        result.statusVariant === "overweight" && "bg-amber-100 text-amber-800 border-amber-200",
                        result.statusVariant === "stunting" && "bg-orange-100 text-orange-800 border-orange-200",
                        result.statusVariant === "severely_stunting" && "bg-orange-200 text-orange-900 border-orange-300",
                        result.statusVariant === "secondary" && "bg-slate-100 text-slate-700 dark:text-white border-slate-200"
                      )}
                    >
                      {result.status}
                    </span>
                  </div>
                </div>

                {/* Recommendation */}
                <div className="bg-slate-50 rounded-xl p-4 text-left mb-6">
                  <p className="text-xs font-bold text-slate-500 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Saran & Rekomendasi
                  </p>
                  <p className="text-sm text-slate-700 dark:text-white leading-relaxed">
                    {result.recommendation}
                  </p>
                </div>

                {/* QR Code */}
                {measurementId && measurementId > 0 && (
                  <div className="flex flex-col items-center mb-6">
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-300 mb-2">
                      Scan QR Code untuk mengunduh laporan
                    </p>
                    <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
                      <QRCode value={`http://localhost:3000/hasil/${measurementId}`} size={140} bgColor="#ffffff" />
                    </div>
                  </div>
                )}

                {/* Notes */}
                <div className="mb-6">
                  <Textarea
                    label="Catatan (opsional)"
                    placeholder="Tambahkan catatan jika diperlukan..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={handleSave}
                    loading={saving}
                    className="flex-1"
                  >
                    <Save className="h-5 w-5" />
                    Simpan Data
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={handleDownloadPDF}
                    className="flex-1"
                  >
                    <Download className="h-5 w-5" />
                    Download PDF
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-center">
            <Button
              variant="ghost"
              size="lg"
              onClick={() => {
                setStep(1);
                setSelectedStudent(null);
                setHeight("");
                setWeight("");
                setResult(null);
                setMeasurementId(null);
                setNotes("");
              }}
            >
              <Plus className="h-5 w-5" />
              Pemeriksaan Baru
            </Button>
          </div>
        </div>
      )}

      {/* Add Student Modal */}
      <Dialog
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        title="Tambah Siswa Baru"
        description="Lengkapi data siswa baru"
        size="lg"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="NIS *"
              placeholder="2024001"
              value={newStudent.nis}
              onChange={(e) => setNewStudent({ ...newStudent, nis: e.target.value })}
            />
            <Input
              label="Nama Lengkap *"
              placeholder="Nama siswa"
              value={newStudent.full_name}
              onChange={(e) => setNewStudent({ ...newStudent, full_name: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-slate-700 dark:text-white">
                Jenis Kelamin *
              </label>
              <div className="flex gap-2">
                {["L", "P"].map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setNewStudent({ ...newStudent, gender: g })}
                    className={cn(
                      "flex-1 h-11 rounded-xl border-2 text-sm font-semibold transition-all",
                      newStudent.gender === g
                        ? "border-green-500 bg-green-50 text-green-700"
                        : "border-slate-300 text-slate-500 dark:text-slate-300 hover:border-slate-400"
                    )}
                  >
                    {g === "L" ? "Laki-laki" : "Perempuan"}
                  </button>
                ))}
              </div>
            </div>
            <Input
              label="Tanggal Lahir *"
              type="date"
              value={newStudent.birth_date}
              onChange={(e) => setNewStudent({ ...newStudent, birth_date: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-slate-700 dark:text-white">Kelas *</label>
            <div className="grid grid-cols-3 gap-2">
              {["I","II","III","IV","V","VI"].map((k) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => setNewStudent({ ...newStudent, class_name: `Kelas ${k}` })}
                  className={cn(
                    "h-10 rounded-xl border-2 text-sm font-semibold transition-all",
                    newStudent.class_name === `Kelas ${k}`
                      ? "border-green-500 bg-green-50 text-green-700"
                      : "border-slate-300 text-slate-500 dark:text-slate-300 hover:border-slate-400"
                  )}
                >
                  {k}
                </button>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setAddModalOpen(false)}>Batal</Button>
          <Button variant="primary" onClick={handleAddStudent} loading={addingStudent}>
            Tambah & Pilih
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}
