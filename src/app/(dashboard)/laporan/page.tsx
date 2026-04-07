"use client";

import { useState, useEffect } from "react";
import { Search, Filter, Eye, Download, FileText, X, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogFooter } from "@/components/ui/dialog";
import { SkeletonTable } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate, formatDateTime } from "@/lib/utils";
import { toast } from "sonner";
import Link from "next/link";

interface Measurement {
  id: number;
  student_name: string;
  student_class: string;
  height: number;
  weight: number;
  bmi: number;
  status_category: string;
  status_variant: "normal" | "obesitas" | "overweight" | "stunting" | "severely_stunting" | "secondary";
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

export default function LaporanPage() {
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [classFilter, setClassFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Get unique classes from data for dropdown options
  const uniqueClasses = [...new Set(measurements.map((m) => m.student_class))].sort();

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (classFilter) params.set("class", classFilter);
    if (statusFilter) params.set("status", statusFilter);

    Promise.all([
      fetch(`/api/measurements?${params}`).then((r) => r.json()),
      fetch(`/api/measurements/summary?${params}`).then((r) => r.json()),
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
  }, [classFilter, statusFilter, search]);

  const filtered = measurements;

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/measurements/${deleteId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
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

  const getMeasurementById = (id: number) => measurements.find((m) => m.id === id);

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
      <div>
        <h1 className="text-2xl font-extrabold text-slate-800 dark:text-slate-200">Laporan</h1>
        <p className="text-sm text-slate-500 dark:text-slate-500 mt-0.5">
          Riwayat dan statistik pemeriksaan status gizi
        </p>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
          {[
            { label: "Total", value: summary.total ?? 0, color: "text-slate-800 dark:text-slate-200", bg: "bg-slate-50" },
            { label: "Normal", value: summary.normal ?? 0, color: "text-green-700", bg: "bg-green-50" },
            { label: "Overweight", value: summary.overweight ?? 0, color: "text-amber-700", bg: "bg-amber-50" },
            { label: "Obesitas", value: summary.obesitas ?? 0, color: "text-red-700", bg: "bg-red-50" },
            { label: "Stunting", value: summary.stunting ?? 0, color: "text-orange-700", bg: "bg-orange-50" },
            { label: "Stunting Berat", value: summary.severe_stunting ?? 0, color: "text-orange-800", bg: "bg-orange-100" },
          ].map((item, i) => (
            <Card key={i}>
              <CardContent className="p-4 text-center">
                <p className={`text-3xl font-extrabold ${item.color}`}>{item.value}</p>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-500 mt-1">{item.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative flex-1 min-w-64">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 " />
              <input
                type="text"
                placeholder="Cari nama siswa..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-10 w-full rounded-xl border border-slate-300 bg-white pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <select
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
              className="h-10 rounded-xl border border-slate-300 bg-white px-4 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">Semua Kelas</option>
              {uniqueClasses.map((k) => (
                <option key={k} value={k}>{k}</option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-10 rounded-xl border border-slate-300 bg-white px-4 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              {statusOptions.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            {hasFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => { setSearch(""); setClassFilter(""); setStatusFilter(""); }}
              >
                <X className="h-4 w-4" />
                Reset
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6">
              <SkeletonTable rows={10} />
            </div>
          ) : filtered.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>No</TableHead>
                  <TableHead>Nama</TableHead>
                  <TableHead>Kelas</TableHead>
                  <TableHead>TB (cm)</TableHead>
                  <TableHead>BB (kg)</TableHead>
                  <TableHead>IMT</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((m, i) => (
                  <TableRow key={m.id}>
                    <TableCell className="text-slate-400 dark:text-slate-500">{i + 1}</TableCell>
                    <TableCell className="font-medium">{m.student_name}</TableCell>
                    <TableCell>{m.student_class}</TableCell>
                    <TableCell>{typeof m.height === 'number' ? m.height : parseFloat(m.height)}</TableCell>
                    <TableCell>{typeof m.weight === 'number' ? m.weight : parseFloat(m.weight)}</TableCell>
                    <TableCell className="font-bold">{typeof m.bmi === 'number' ? m.bmi.toFixed(1) : parseFloat(m.bmi).toFixed(1)}</TableCell>
                    <TableCell>
                      <Badge variant={(m.status_variant || 'secondary') as "normal" | "obesitas" | "overweight" | "stunting" | "severely_stunting" | "secondary" | "outline" | "destructive" | "info" | "warning"}>{m.status_category}</Badge>
                    </TableCell>
                    <TableCell className="text-xs text-slate-400 dark:text-slate-500">
                      {formatDateTime(m.checked_at)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Link href={`/hasil/${m.id}`} target="_blank">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteId(m.id)}
                          className="text-red-500 hover:text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="py-20 flex flex-col items-center justify-center text-slate-400  space-y-3">
              <FileText className="h-12 w-12 opacity-30" />
              <p className="text-sm">
                {hasFilters || search
                  ? "Tidak ada hasil untuk filter yang dipilih"
                  : "Belum ada data pemeriksaan"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteId !== null}
        onClose={() => setDeleteId(null)}
        title="Hapus Pemeriksaan?"
        description="Tindakan ini tidak dapat dibatalkan."
        size="sm"
      >
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Data pemeriksaan {deleteId && getMeasurementById(deleteId) ? `siswa "${getMeasurementById(deleteId)!.student_name}"` : ""} akan dihapus permanen dari sistem.
        </p>
        <DialogFooter>
          <Button variant="outline" onClick={() => setDeleteId(null)} disabled={deleting}>
            Batal
          </Button>
          <Button variant="destructive" onClick={handleDelete} loading={deleting}>
            Ya, Hapus
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}
