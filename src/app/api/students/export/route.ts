import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { students } from "@/db/schema";
import { sql } from "drizzle-orm";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    const format = searchParams.get("format") || "xlsx";

    const db = getDb();

    let query = db.select().from(students).orderBy(students.full_name);

    const result = await query;

    // Apply search filter in memory
    let filtered = result;
    if (search) {
      const q = search.toLowerCase();
      filtered = result.filter(
        (s) =>
          s.full_name?.toLowerCase().includes(q) ||
          s.nis?.toLowerCase().includes(q) ||
          s.class_name?.toLowerCase().includes(q)
      );
    }

    if (format === "csv") {
      // Generate CSV
      const headers = ["NIS", "Nama", "Jenis Kelamin", "Tanggal Lahir", "Kelas", "Asal Sekolah", "Nama Orang Tua", "No HP", "Dibuat"];
      const rows = filtered.map((s) => [
        s.nis,
        s.full_name,
        s.gender === "L" ? "Laki-laki" : "Perempuan",
        s.birth_date ? new Date(s.birth_date).toISOString().split("T")[0] : "",
        s.class_name || "",
        s.school_name || "SD / MI / SMP / SMA Negeri",
        s.parent_name || "",
        s.parent_phone || "",
        s.created_at ? new Date(s.created_at).toISOString().split("T")[0] : "",
      ]);

      const csv = [headers, ...rows]
        .map((row) =>
          row
            .map((cell) =>
              typeof cell === "string" && (cell.includes(",") || cell.includes('"') || cell.includes("\n"))
                ? `"${cell.replace(/"/g, '""')}"`
                : cell ?? ""
            )
            .join(",")
        )
        .join("\n");

      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv;charset=utf-8",
          "Content-Disposition": `attachment; filename="Data_Siswa_${new Date().toISOString().split("T")[0]}.csv"`,
        },
      });
    }

    // Generate XLSX
    const XLSX = await import("xlsx");

    const headers = [
      "NIS",
      "Nama Lengkap",
      "Jenis Kelamin",
      "Tanggal Lahir",
      "Kelas",
      "Asal Sekolah",
      "Nama Orang Tua",
      "No HP Orang Tua",
      "Tanggal Dibuat",
    ];

    const rows = filtered.map((s) => [
      s.nis,
      s.full_name,
      s.gender === "L" ? "Laki-laki" : "Perempuan",
      s.birth_date ? new Date(s.birth_date) : null,
      s.class_name || "",
      s.school_name || "SD / MI / SMP / SMA Negeri",
      s.parent_name || "",
      s.parent_phone || "",
      s.created_at ? new Date(s.created_at) : null,
    ]);

    const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);

    // Set column widths
    ws["!cols"] = [
      { wch: 12 }, // NIS
      { wch: 25 }, // Nama
      { wch: 14 }, // JK
      { wch: 14 }, // Tanggal Lahir
      { wch: 10 }, // Kelas
      { wch: 25 }, // Asal Sekolah
      { wch: 20 }, // Orang Tua
      { wch: 15 }, // HP
      { wch: 14 }, // Dibuat
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Data Siswa");

    // Add summary sheet
    const genderCount = filtered.filter((s) => s.gender === "L").length;
    const femaleCount = filtered.filter((s) => s.gender === "P").length;
    const kelasCount: Record<string, number> = {};
    for (const s of filtered) {
      const k = s.class_name || "Lainnya";
      kelasCount[k] = (kelasCount[k] || 0) + 1;
    }

    const summaryData = [
      ["RINGKASAN DATA SISWA"],
      [""],
      ["Total Siswa", filtered.length],
      ["Laki-laki", genderCount],
      ["Perempuan", femaleCount],
      [""],
      ["Distribusi Per Kelas", ""],
      ...Object.entries(kelasCount).map(([kelas, count]) => [kelas, count]),
      [""],
      ["Dicetak", new Date().toLocaleString("id-ID")],
    ];

    const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
    wsSummary["!cols"] = [{ wch: 25 }, { wch: 15 }];
    XLSX.utils.book_append_sheet(wb, wsSummary, "Ringkasan");

    const buffer = XLSX.write(wb, {
      type: "buffer",
      bookType: "xlsx",
    });

    return new Response(buffer, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="Data_Siswa_${new Date().toISOString().split("T")[0]}.xlsx"`,
      },
    });
  } catch (error) {
    console.error("Export error:", error);
    return NextResponse.json({ error: "Gagal mengekspor data" }, { status: 500 });
  }
}
