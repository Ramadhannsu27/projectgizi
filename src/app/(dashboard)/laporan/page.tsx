"use client";

import { useState, useEffect } from "react";
import { Search, Eye, Download, FileText, X, Trash2, Pencil, History, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogFooter } from "@/components/ui/dialog";
import { SkeletonTable } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { formatDate, formatDateTime, isAuthenticated } from "@/lib/utils";
import { toast } from "sonner";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface Measurement {
  id: number;
  student_id: number;
  student_name: string;
  student_class: string;
  student_school_name: string;
  height: number;
  weight: number;
  bmi: number;
  status_category: string;
  notes: string;
  checked_at: string;
}

interface Summary {
  total: number;
  normal: number;
  overweight: number;
  obesitas: number;
  stunting: number;
  severe_stunting: number;
}

interface Student {
  id: number;
  nis: string;
  full_name: string;
  class_name: string;
  gender: string;
  birth_date: string;
}

interface HistoryData {
  student: Student;
  history: HistoryItem[];
}

interface HistoryItem {
  id: number;
  student_name: string;
  student_class: string;
  height: number | string;
  weight: number | string;
  bmi: number | string;
  status_category: string;
  notes: string;
  checked_at: string;
}

export default function LaporanPage() {
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [classFilter, setClassFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    setAuthed(isAuthenticated());
  }, []);

  // Delete modal
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Edit modal
  const [editData, setEditData] = useState<Measurement | null>(null);
  const [editHeight, setEditHeight] = useState("");
  const [editWeight, setEditWeight] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const [saving, setSaving] = useState(false);

  // History modal
  const [historyStudent, setHistoryStudent] = useState<HistoryData | null>(null);
  const [historyLoading, setHistoryLoading] = useState(false);

  const uniqueClasses = [...new Set(measurements.map((m) => m.student_class))].sort();

  const fetchData = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (classFilter) params.set("class", classFilter);
    if (statusFilter) params.set("status", statusFilter);

    Promise.all([
      fetch(`/api/measurements?${params}`, {
        headers: authed ? { Authorization: `Bearer ${localStorage.getItem("auth_token")}` } : {},
      }).then((r) => r.json()),
      fetch(`/api/measurements/summary?${params}`, {
        headers: authed ? { Authorization: `Bearer ${localStorage.getItem("auth_token")}` } : {},
      }).then((r) => r.json()),
    ])
      .then(([mData, sData]) => {
        setMeasurements(mData);
        setSummary(sData);
      })
      .catch(() => {
        setMeasurements([]);
        setSummary(null);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, [classFilter, statusFilter, search]);

  // Handle delete
  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/measurements/${deleteId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${localStorage.getItem("auth_token")}` },
      });
      if (res.ok) {
        setMeasurements(measurements.filter((m) => m.id !== deleteId));
        toast.success("Data pemeriksaan berhasil dihapus");
        setDeleteId(null);
      } else {
        toast.error("Gagal menghapus data");
      }
    } catch {
      toast.error("Terjadi kesalahan");
    } finally {
      setDeleting(false);
    }
  };

  // Open edit modal
  const openEdit = (m: Measurement) => {
    setEditData(m);
    setEditHeight(typeof m.height === "number" ? m.height.toString() : m.height);
    setEditWeight(typeof m.weight === "number" ? m.weight.toString() : m.weight);
    setEditNotes(m.notes || "");
  };

  // Handle update
  const handleUpdate = async () => {
    if (!editData) return;

    const h = parseFloat(editHeight);
    const w = parseFloat(editWeight);
    if (isNaN(h) || isNaN(w) || h < 50 || h > 250 || w < 3 || w > 200) {
      toast.error("Nilai tinggi/berat tidak valid");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`/api/measurements/${editData.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
        body: JSON.stringify({ height: h, weight: w, notes: editNotes }),
      });

      if (res.ok) {
        toast.success("Data berhasil diperbarui");
        setEditData(null);
        fetchData();
      } else {
        const data = await res.json();
        toast.error(data.error || "Gagal memperbarui data");
      }
    } catch {
      toast.error("Terjadi kesalahan");
    } finally {
      setSaving(false);
    }
  };

  // Open history modal
  const openHistory = async (m: Measurement) => {
    setHistoryLoading(true);
    try {
      const res = await fetch(`/api/measurements/student/${m.student_id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("auth_token")}` },
      });
      if (res.ok) {
        const data = await res.json();
        setHistoryStudent(data);
      } else {
        toast.error("Gagal memuat riwayat");
      }
    } catch {
      toast.error("Terjadi kesalahan");
    } finally {
      setHistoryLoading(false);
    }
  };


  const statusOptions = [
    { value: "", label: "Semua Status" },
    { value: "Normal", label: "Normal" },
    { value: "Overweight", label: "Overweight" },
    { value: "Obesitas", label: "Obesitas" },
    { value: "Stunting", label: "Stunting" },
    { value: "Stunting Berat", label: "Stunting Berat" },
  ];

  const hasFilters = search || classFilter || statusFilter;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 dark:text-slate-200">Laporan</h1>
          <p className="text-sm text-slate-500 dark:text-slate-500 mt-0.5">
            Riwayat dan statistik pemeriksaan status gizi
          </p>
        </div>
        {authed && (
          <Link href="/pemeriksaan">
            <Button variant="primary" size="lg">
              <FileText className="h-5 w-5" />
              Pemeriksaan Baru
            </Button>
          </Link>
        )}
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
          {[
            { label: "Total", value: summary.total ?? 0, gradient: "from-slate-500 to-slate-600", filter: "" },
            { label: "Normal", value: summary.normal ?? 0, gradient: "from-green-500 to-green-600", filter: "Normal" },
            { label: "Overweight", value: summary.overweight ?? 0, gradient: "from-amber-500 to-amber-600", filter: "Overweight" },
            { label: "Obesitas", value: summary.obesitas ?? 0, gradient: "from-red-500 to-red-600", filter: "Obesitas" },
            { label: "Stunting", value: summary.stunting ?? 0, gradient: "from-orange-500 to-orange-600", filter: "Stunting" },
            { label: "St. Berat", value: summary.severe_stunting ?? 0, gradient: "from-orange-600 to-orange-700", filter: "Stunting Berat" },
          ].map((item, i) => (
            <button
              key={i}
              onClick={() => {
                setStatusFilter(item.filter);
                setSearch("");
                setClassFilter("");
              }}
              className={cn(
                "text-left rounded-xl border-2 transition-all overflow-hidden hover:shadow-md",
                statusFilter === item.filter
                  ? "border-green-500 shadow-md"
                  : "border-transparent hover:border-slate-200 dark:hover:border-slate-700"
              )}
            >
              <div className={cn("h-1 bg-gradient-to-r", item.gradient)} />
              <CardContent className="p-3">
                <p className="text-2xl font-extrabold text-slate-800 dark:text-slate-200">{item.value}</p>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-500 mt-0.5">{item.label}</p>
              </CardContent>
            </button>
          ))}
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative flex-1 min-w-64">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                type="text"
                placeholder="Cari nama siswa..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-10 w-full rounded-xl border border-slate-300 bg-white dark:bg-slate-800 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <select
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
              className="h-10 rounded-xl border border-slate-300 bg-white dark:bg-slate-800 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">Semua Kelas</option>
              {uniqueClasses.map((k) => (
                <option key={k} value={k}>{k}</option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-10 rounded-xl border border-slate-300 bg-white dark:bg-slate-800 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              {statusOptions.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            {hasFilters && (
              <Button variant="ghost" size="sm" onClick={() => { setSearch(""); setClassFilter(""); setStatusFilter(""); }}>
                <X className="h-4 w-4" />
                Reset
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6">
              <SkeletonTable rows={10} />
            </div>
          ) : measurements.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>No</TableHead>
                    <TableHead>Nama</TableHead>
                    <TableHead>Kelas</TableHead>
                    <TableHead>Asal Sekolah</TableHead>
                    <TableHead>TB (cm)</TableHead>
                    <TableHead>BB (kg)</TableHead>
                    <TableHead>IMT</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {measurements.map((m, i) => (
                    <TableRow key={m.id} className="group">
                      <TableCell className="text-slate-400">{i + 1}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center text-white font-bold text-xs">
                            {m.student_name.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-medium">{m.student_name}</span>
                        </div>
                      </TableCell>
                      <TableCell>{m.student_class}</TableCell>
                      <TableCell className="text-xs text-slate-500">{m.student_school_name || "-"}</TableCell>
                      <TableCell>{typeof m.height === "number" ? m.height : parseFloat(m.height)}</TableCell>
                      <TableCell>{typeof m.weight === "number" ? m.weight : parseFloat(m.weight)}</TableCell>
                      <TableCell className="font-bold">{typeof m.bmi === "number" ? m.bmi.toFixed(1) : parseFloat(m.bmi).toFixed(1)}</TableCell>
                      <TableCell>
                        <Badge variant={m.status_category === "Normal" ? "normal" : m.status_category === "Obesitas" ? "obesitas" : m.status_category === "Overweight" ? "overweight" : m.status_category === "Stunting" ? "stunting" : m.status_category === "Stunting Berat" ? "severely_stunting" : "secondary"}>
                          {m.status_category}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-slate-400">
                        {formatDateTime(m.checked_at)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                          {/* View */}
                          <Link href={`/hasil/${m.id}`} target="_blank">
                            <Button variant="ghost" size="sm" title="Lihat Hasil">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>

                          {/* Edit */}
                          {authed && (
                            <Button variant="ghost" size="sm" title="Edit" onClick={() => openEdit(m)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                          )}

                          {/* History */}
                          <Button variant="ghost" size="sm" title="Riwayat Siswa" onClick={() => openHistory(m)}>
                            <History className="h-4 w-4" />
                          </Button>

                          {/* Delete */}
                          {authed && (
                            <Button
                              variant="ghost"
                              size="sm"
                              title="Hapus"
                              onClick={() => setDeleteId(m.id)}
                              className="text-red-400 hover:text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="py-20 flex flex-col items-center justify-center text-slate-400 space-y-3">
              <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                <FileText className="h-8 w-8 opacity-30" />
              </div>
              <p className="text-sm">
                {hasFilters ? "Tidak ada hasil untuk filter yang dipilih" : "Belum ada data pemeriksaan"}
              </p>
              {!hasFilters && authed && (
                <Link href="/pemeriksaan">
                  <Button variant="outline" size="sm">Mulai Pemeriksaan</Button>
                </Link>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteId !== null} onClose={() => setDeleteId(null)} title="Hapus Pemeriksaan?" description="Tindakan ini tidak dapat dibatalkan." size="sm">
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Data pemeriksaan akan dihapus permanen dari sistem.
        </p>
        <DialogFooter>
          <Button variant="outline" onClick={() => setDeleteId(null)} disabled={deleting}>Batal</Button>
          <Button variant="destructive" onClick={handleDelete} loading={deleting}>Ya, Hapus</Button>
        </DialogFooter>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog
        open={editData !== null}
        onClose={() => setEditData(null)}
        title="Edit Data Pemeriksaan"
        description={`Edit data pemeriksaan untuk ${editData?.student_name}`}
        size="md"
      >
        {editData && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Tinggi Badan (cm)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="50"
                  max="250"
                  value={editHeight}
                  onChange={(e) => setEditHeight(e.target.value)}
                  className="h-11 w-full rounded-xl border border-slate-300 bg-white dark:bg-slate-800 px-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Berat Badan (kg)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="3"
                  max="200"
                  value={editWeight}
                  onChange={(e) => setEditWeight(e.target.value)}
                  className="h-11 w-full rounded-xl border border-slate-300 bg-white dark:bg-slate-800 px-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>
            <Textarea
              label="Catatan"
              placeholder="Tambahkan catatan..."
              value={editNotes}
              onChange={(e) => setEditNotes(e.target.value)}
            />
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={() => setEditData(null)} disabled={saving}>Batal</Button>
          <Button variant="primary" onClick={handleUpdate} loading={saving}>Simpan Perubahan</Button>
        </DialogFooter>
      </Dialog>

      {/* History Dialog */}
      <Dialog
        open={historyStudent !== null}
        onClose={() => setHistoryStudent(null)}
        title="Riwayat Pemeriksaan"
        description={historyStudent ? `Semua pemeriksaan ${historyStudent.student.full_name}` : ""}
        size="lg"
      >
        {historyLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <SkeletonTable key={i} rows={1} />
            ))}
          </div>
        ) : historyStudent ? (
          <div className="space-y-3">
            {/* Student Info */}
            <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center text-white font-bold text-lg">
                  {historyStudent.student.full_name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-bold text-slate-800 dark:text-slate-200">{historyStudent.student.full_name}</p>
                  <p className="text-sm text-slate-500">{historyStudent.student.nis} &middot; {historyStudent.student.class_name}</p>
                </div>
              </div>
              <p className="text-xs text-slate-400">
                Total pemeriksaan: <span className="font-bold">{historyStudent.history.length}x</span>
              </p>
            </div>

            {/* History Timeline */}
            <div className="max-h-80 overflow-y-auto space-y-3">
              {historyStudent.history.map((h, i) => {
                const prev = historyStudent.history[i + 1];
                const diff = Number(h.bmi) - (prev ? Number(prev.bmi) : 0);
                const trend = Math.abs(diff) < 0.1 ? "stable" : diff > 0 ? "up" : "down";
                const isCurrent = h.id === (measurements.find(m => m.student_id === historyStudent.student.id)?.id ?? 0);
                return (
                  <div key={h.id} className="flex items-start gap-3">
                    {/* Timeline dot */}
                    <div className="flex flex-col items-center">
                      <div className={cn(
                        "w-3 h-3 rounded-full mt-1.5",
                        h.status_category === "Normal" ? "bg-green-500" :
                        h.status_category === "Obesitas" ? "bg-red-500" :
                        h.status_category === "Overweight" ? "bg-amber-500" :
                        h.status_category === "Stunting" ? "bg-orange-500" :
                        h.status_category === "Stunting Berat" ? "bg-orange-600" :
                        "bg-slate-400"
                      )} />
                      {i < historyStudent.history.length - 1 && <div className="w-0.5 flex-1 bg-slate-200 dark:bg-slate-700 mt-1" />}
                    </div>

                    {/* Content */}
                    <div className="flex-1 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-xs font-semibold text-slate-400">{formatDateTime(h.checked_at)}</p>
                            {trend && (
                              <span className={cn(
                                "flex items-center gap-0.5 text-xs",
                                trend === "up" ? "text-red-500" : trend === "down" ? "text-green-500" : "text-slate-400"
                              )}>
                                {trend === "up" ? <TrendingUp className="h-3 w-3" /> : trend === "down" ? <TrendingDown className="h-3 w-3" /> : <Minus className="h-3 w-3" />}
                                {trend === "up" ? "Naik" : trend === "down" ? "Turun" : "Stabil"}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-4 mt-1">
                            <div>
                              <p className="text-xs text-slate-400">TB</p>
                              <p className="font-bold text-slate-800 dark:text-slate-200">{typeof h.height === "number" ? h.height : parseFloat(String(h.height))} cm</p>
                            </div>
                            <div>
                              <p className="text-xs text-slate-400">BB</p>
                              <p className="font-bold text-slate-800 dark:text-slate-200">{typeof h.weight === "number" ? h.weight : parseFloat(String(h.weight))} kg</p>
                            </div>
                            <div>
                              <p className="text-xs text-slate-400">IMT</p>
                              <p className="font-bold text-slate-800 dark:text-slate-200">{typeof h.bmi === "number" ? h.bmi.toFixed(1) : parseFloat(String(h.bmi)).toFixed(1)}</p>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <Badge variant={h.status_category === "Normal" ? "normal" : h.status_category === "Obesitas" ? "obesitas" : h.status_category === "Overweight" ? "overweight" : h.status_category === "Stunting" ? "stunting" : h.status_category === "Stunting Berat" ? "severely_stunting" : "secondary"}>
                            {h.status_category}
                          </Badge>
                          <div className="flex items-center gap-1">
                            <Link href={`/hasil/${h.id}`} target="_blank">
                              <Button variant="ghost" size="sm" className="h-7 px-2">
                                <Eye className="h-3.5 w-3.5" />
                              </Button>
                            </Link>
                            {authed && (
                              <Button variant="ghost" size="sm" className="h-7 px-2" onClick={() => { setHistoryStudent(null); openEdit({ ...h, student_id: historyStudent.student.id, student_class: h.student_class || historyStudent.student.class_name, student_name: h.student_name || historyStudent.student.full_name } as Measurement); }}>
                                <Pencil className="h-3.5 w-3.5" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                      {h.notes && (
                        <p className="text-xs text-slate-400 mt-2 italic">Catatan: {h.notes}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {historyStudent.history.length === 0 && (
              <p className="text-center text-slate-400 py-8">Belum ada riwayat pemeriksaan</p>
            )}
          </div>
        ) : null}
      </Dialog>
    </div>
  );
}
