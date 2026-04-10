"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, Plus, Pencil, Trash2, Users, X, Upload, FileSpreadsheet, CheckCircle, XCircle, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { SkeletonTable } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { cn, calculateAgeYears, formatDate, isAuthenticated } from "@/lib/utils";

const KELAS_OPTIONS = [
  { value: "I", label: "Kelas I" },
  { value: "II", label: "Kelas II" },
  { value: "III", label: "Kelas III" },
  { value: "IV", label: "Kelas IV" },
  { value: "V", label: "Kelas V" },
  { value: "VI", label: "Kelas VI" },
  { value: "VII", label: "Kelas VII" },
  { value: "VIII", label: "Kelas VIII" },
  { value: "IX", label: "Kelas IX" },
  { value: "X", label: "Kelas X" },
  { value: "XI", label: "Kelas XI" },
  { value: "XII", label: "Kelas XII" },
];

const JK_OPTIONS = [
  { value: "L", label: "Laki-laki" },
  { value: "P", label: "Perempuan" },
];

interface Student {
  id: number;
  nis: string;
  full_name: string;
  gender: "L" | "P";
  birth_date: string;
  class_name: string;
  school_name: string;
  parent_name: string;
  parent_phone: string;
}

interface StudentForm {
  nis: string;
  full_name: string;
  gender: string;
  birth_date: string;
  class_name: string;
  school_name: string;
  parent_name: string;
  parent_phone: string;
}

const emptyForm: StudentForm = {
  nis: "",
  full_name: "",
  gender: "",
  birth_date: "",
  class_name: "",
  school_name: "SD / MI / SMP / SMA Negeri",
  parent_name: "",
  parent_phone: "",
};

export default function SiswaPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<StudentForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formErrors, setFormErrors] = useState<Partial<StudentForm>>({});
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{ inserted: number; skipped: number; message: string } | null>(null);
  const [sortOrder, setSortOrder] = useState<"fifo" | "lifo">("fifo");
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    setAuthed(isAuthenticated());
  }, []);

  // Handle Excel import
  const handleImportExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.match(/\.(xlsx|xls|csv)$/i)) {
      toast.error("Format file harus .xlsx, .xls, atau .csv");
      e.target.value = "";
      return;
    }

    setImporting(true);
    setImportResult(null);

    const fd = new FormData();
    fd.append("file", file);

    try {
      const res = await fetch("/api/students/import", {
        method: "POST",
        body: fd,
      });

      const data = await res.json();

      if (res.ok) {
        setImportResult(data);
        toast.success(data.message);
        fetchStudents();
      } else {
        toast.error(data.error || "Gagal mengimpor file");
      }
    } catch {
      toast.error("Terjadi kesalahan saat mengimpor");
    } finally {
      setImporting(false);
      e.target.value = "";
    }
  };

  // Download template Excel
  const downloadTemplate = async () => {
    const XLSX = await import("xlsx");
    const ws = XLSX.utils.aoa_to_sheet([
      ["NIS", "Nama", "Jenis Kelamin", "Tanggal Lahir", "Kelas", "Asal Sekolah", "Nama Orang Tua", "No HP Orang Tua"],
      ["2024001", "Ahmad Fauzi", "L", "2009-03-15", "IV", "SD Negeri 1 Jakarta", "Budi Santoso", "081234567890"],
      ["2024002", "Siti Nurhaliza", "P", "2009-07-22", "III", "SD Negeri 1 Jakarta", "Hartini", "081234567891"],
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Data Siswa");
    XLSX.writeFile(wb, "Template_Import_Siswa.xlsx");
  };

  const fetchStudents = useCallback(async () => {
    try {
      const res = await fetch(`/api/students?sort=${sortOrder}`, {
        headers: authed ? { Authorization: `Bearer ${localStorage.getItem("auth_token")}` } : {},
      });
      if (res.ok) {
        setStudents(await res.json());
      } else {
        setStudents([]);
      }
    } catch {
      setStudents([]);
    } finally {
      setLoading(false);
    }
  }, [sortOrder]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents, authed]);

  const filtered = students.filter(
    (s) =>
      s.full_name.toLowerCase().includes(search.toLowerCase()) ||
      s.nis.includes(search)
  );

  const validate = (): boolean => {
    const errors: Partial<StudentForm> = {};
    if (!form.nis.trim()) errors.nis = "NIS wajib diisi";
    if (!form.full_name.trim()) errors.full_name = "Nama wajib diisi";
    if (!form.gender) errors.gender = "Jenis kelamin wajib dipilih";
    if (!form.birth_date) errors.birth_date = "Tanggal lahir wajib diisi";
    if (!form.class_name) errors.class_name = "Kelas wajib dipilih";
    if (!form.school_name.trim()) errors.school_name = "Asal sekolah wajib diisi";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);

    try {
      const url = editId ? `/api/students/${editId}` : "/api/students";
      const method = editId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        toast.success(
          editId
            ? `Data siswa "${form.full_name}" berhasil diperbarui`
            : `Siswa "${form.full_name}" berhasil ditambahkan`
        );
        setModalOpen(false);
        setEditId(null);
        setForm(emptyForm);
        fetchStudents();
      } else {
        const data = await res.json();
        toast.error(data.error || "Gagal menyimpan data");
      }
    } catch {
      toast.error("Terjadi kesalahan koneksi");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (student: Student) => {
    setEditId(student.id);
    setFormErrors({});
    setForm({
      nis: student.nis,
      full_name: student.full_name,
      gender: student.gender,
      birth_date: student.birth_date,
      class_name: student.class_name,
      school_name: student.school_name || "SD / MI / SMP / SMA Negeri",
      parent_name: student.parent_name || "",
      parent_phone: student.parent_phone || "",
    });
    setModalOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const res = await fetch(`/api/students/${deleteId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
      });
      if (res.ok) {
        toast.success("Siswa berhasil dihapus");
        setDeleteId(null);
        fetchStudents();
      } else {
        toast.error("Gagal menghapus siswa");
      }
    } catch {
      toast.error("Terjadi kesalahan");
    }
  };

  const openAdd = () => {
    setEditId(null);
    setForm(emptyForm);
    setFormErrors({});
    setModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 dark:text-slate-200">
            Manajemen Siswa
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-500 mt-0.5">
            {loading ? "Memuat..." : `${students.length} siswa terdaftar`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <a
            href={`/api/students/export?format=xlsx${search ? `&search=${encodeURIComponent(search)}` : ""}`}
            download
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-300 bg-white dark:bg-slate-800 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          >
            <Download className="h-4 w-4" />
            Export XLSX
          </a>
          <a
            href={`/api/students/export?format=csv${search ? `&search=${encodeURIComponent(search)}` : ""}`}
            download
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-300 bg-white dark:bg-slate-800 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          >
            Export CSV
          </a>
          {authed && (
            <>
              <label
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-300 bg-white dark:bg-slate-800 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer transition-colors"
              >
                <Upload className="h-4 w-4" />
                Import Excel
                <input
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  className="hidden"
                  onChange={handleImportExcel}
                  disabled={importing}
                />
              </label>
              <Button variant="primary" size="lg" onClick={openAdd}>
                <Plus className="h-5 w-5" />
                Tambah Siswa
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Search & Sort */}
      <div className="flex items-center gap-3">
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 " />
          <input
            type="text"
            placeholder="Cari nama atau NIS..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-12 w-full rounded-xl border border-slate-300 bg-white dark:bg-slate-800 pl-12 pr-4 text-sm transition-colors hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 rounded-xl p-1">
          <button
            onClick={() => setSortOrder("fifo")}
            className={cn(
              "px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors",
              sortOrder === "fifo"
                ? "bg-white dark:bg-slate-700 text-green-600 shadow-sm"
                : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            )}
            title="FIFO: NIS terkecil duluan"
          >
            FIFO
          </button>
          <button
            onClick={() => setSortOrder("lifo")}
            className={cn(
              "px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors",
              sortOrder === "lifo"
                ? "bg-white dark:bg-slate-700 text-green-600 shadow-sm"
                : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            )}
            title="LIFO: NIS terbesar duluan"
          >
            LIFO
          </button>
        </div>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6">
              <SkeletonTable rows={8} />
            </div>
          ) : filtered.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>No</TableHead>
                  <TableHead>NIS</TableHead>
                  <TableHead>Nama</TableHead>
                  <TableHead>JK</TableHead>
                  <TableHead>Tanggal Lahir</TableHead>
                  <TableHead>Umur</TableHead>
                  <TableHead>Kelas</TableHead>
                  <TableHead>Asal Sekolah</TableHead>
                  <TableHead>Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((student, i) => (
                  <TableRow key={student.id}>
                    <TableCell className="text-slate-400 ">{i + 1}</TableCell>
                    <TableCell className="font-mono text-xs">
                      {student.nis}
                    </TableCell>
                    <TableCell className="font-medium">
                      {student.full_name}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          student.gender === "L" ? "info" : "destructive"
                        }
                      >
                        {student.gender === "L" ? "L" : "P"}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(student.birth_date)}</TableCell>
                    <TableCell>{calculateAgeYears(student.birth_date)}</TableCell>
                    <TableCell>{student.class_name}</TableCell>
                    <TableCell className="text-xs text-slate-500">{student.school_name}</TableCell>
                    <TableCell>
                      {authed && (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleEdit(student)}
                            className="p-2 rounded-lg text-slate-400  hover:text-blue-600 hover:bg-blue-50 transition-colors"
                            title="Edit"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setDeleteId(student.id)}
                            className="p-2 rounded-lg text-slate-400  hover:text-red-600 hover:bg-red-50 transition-colors"
                            title="Hapus"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="py-20 flex flex-col items-center justify-center text-slate-400  space-y-4">
              <Users className="h-12 w-12 opacity-30" />
              <div className="text-center">
                <p className="text-base font-semibold text-slate-500 dark:text-slate-500">
                  {search ? "Siswa tidak ditemukan" : "Belum ada data siswa"}
                </p>
                <p className="text-sm mt-1">
                  {search
                    ? `Tidak ada siswa dengan nama/NIS "${search}"`
                    : "Tambahkan siswa pertama untuk memulai"}
                </p>
              </div>
              {!search && authed && (
                <Button variant="outline" onClick={openAdd}>
                  <Plus className="h-4 w-4" />
                  Tambah Siswa
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Modal */}
      <Dialog
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editId ? "Edit Siswa" : "Tambah Siswa Baru"}
        description="Lengkapi data siswa di bawah ini"
        size="lg"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="NIS *"
              placeholder="Contoh: 2024001"
              value={form.nis}
              readOnly={!!editId}
              className={editId ? "bg-slate-100 dark:bg-slate-700 cursor-not-allowed" : ""}
              onChange={(e) => setForm({ ...form, nis: e.target.value })}
              error={formErrors.nis}
            />
            <Input
              label="Nama Lengkap *"
              placeholder="Nama siswa"
              value={form.full_name}
              onChange={(e) =>
                setForm({ ...form, full_name: e.target.value })
              }
              error={formErrors.full_name}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Jenis Kelamin *"
              options={JK_OPTIONS}
              value={form.gender}
              onChange={(e) => setForm({ ...form, gender: e.target.value })}
              error={formErrors.gender}
              placeholder="Pilih..."
            />
            <Input
              label="Tanggal Lahir *"
              type="date"
              value={form.birth_date}
              onChange={(e) =>
                setForm({ ...form, birth_date: e.target.value })
              }
              error={formErrors.birth_date}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Kelas *"
              options={KELAS_OPTIONS}
              value={form.class_name}
              onChange={(e) => setForm({ ...form, class_name: e.target.value })}
              error={formErrors.class_name}
              placeholder="Pilih kelas..."
            />
            <Input
              label="Asal Sekolah *"
              placeholder="Contoh: SD Negeri 1 Jakarta"
              value={form.school_name}
              onChange={(e) => setForm({ ...form, school_name: e.target.value })}
              error={formErrors.school_name}
            />
          </div>

          <Input
            label="Nama Orang Tua / Wali"
            placeholder="Nama orang tua atau wali"
            value={form.parent_name}
            onChange={(e) =>
              setForm({ ...form, parent_name: e.target.value })
            }
          />

          <Input
            label="No. HP Orang Tua (Opsional)"
            placeholder="08xxxxxxxxxx"
            type="tel"
            value={form.parent_phone}
            onChange={(e) =>
              setForm({ ...form, parent_phone: e.target.value })
            }
            hint="Akan digunakan untuk notifikasi hasil pemeriksaan"
          />
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setModalOpen(false)}
            disabled={saving}
          >
            Batal
          </Button>
          <Button
            variant="primary"
            onClick={handleSave}
            loading={saving}
          >
            {editId ? "Simpan Perubahan" : "Tambah Siswa"}
          </Button>
        </DialogFooter>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog
        open={deleteId !== null}
        onClose={() => setDeleteId(null)}
        title="Hapus Siswa?"
        description="Tindakan ini tidak dapat dibatalkan."
        size="sm"
      >
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Data siswa dan seluruh riwayat pemeriksaan akan dihapus permanen.
        </p>
        <DialogFooter>
          <Button variant="outline" onClick={() => setDeleteId(null)}>
            Batal
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            Ya, Hapus
          </Button>
        </DialogFooter>
      </Dialog>

      {/* Import Result Modal */}
      {importResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-sm mx-4 p-6">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-lg font-bold text-slate-800 dark:text-white">Import Berhasil</h2>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between px-4 py-2 bg-green-50 rounded-xl">
                  <span className="flex items-center gap-2 text-green-700">
                    <CheckCircle className="h-4 w-4" /> Dimasukkan
                  </span>
                  <span className="font-bold text-green-800">{importResult.inserted} siswa</span>
                </div>
                {importResult.skipped > 0 && (
                  <div className="flex items-center justify-between px-4 py-2 bg-amber-50 rounded-xl">
                    <span className="flex items-center gap-2 text-amber-700">
                      <XCircle className="h-4 w-4" /> Dilewati (NIS duplikat)
                    </span>
                    <span className="font-bold text-amber-800">{importResult.skipped} siswa</span>
                  </div>
                )}
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {importResult.message}
              </p>
              <div className="pt-2 space-y-2">
                <button
                  onClick={downloadTemplate}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl border border-slate-300 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <FileSpreadsheet className="h-4 w-4" />
                  Download Template Excel
                </button>
                <button
                  onClick={() => { setImportResult(null); fetchStudents(); }}
                  className="w-full px-4 py-2.5 rounded-xl bg-green-600 text-white font-bold hover:bg-green-700 transition-colors"
                >
                  Selesai
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
