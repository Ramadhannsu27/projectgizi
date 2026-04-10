import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { students } from "@/db/schema";
import mysql from "mysql2/promise";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "File tidak ditemukan" }, { status: 400 });
    }

    const buffer = await file.arrayBuffer();
    const XLSX = await import("xlsx");
    const workbook = XLSX.read(new Uint8Array(buffer), { type: "array" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const raw: Record<string, unknown>[] = sheet ? XLSX.utils.sheet_to_json(sheet) : [];

    if (raw.length === 0) {
      return NextResponse.json({ error: "File Excel kosong atau tidak memiliki data" }, { status: 400 });
    }

    // Normalize column names (handle various formats)
    const rows = raw.map((row) => {
      const keys = Object.keys(row);
      const normalized: Record<string, unknown> = {};

      for (const key of keys) {
        const k = key.toLowerCase().trim().replace(/\s+/g, "_");
        normalized[k] = (row as Record<string, unknown>)[key];
      }

      return normalized;
    });

    // Map to student fields
    const studentsToInsert = rows
      .map((r) => {
        const nis = String(r.nis || r.no || r.no_absen || r["no._absen"] || "").trim();
        const full_name = String(r.nama || r.full_name || r["nama_lengkap"] || r.name || "").trim();
        const gender = String(r.jenis_kelamin || r.jk || r.gender || r.sex || "").trim().toUpperCase();
        const birth_date = r.tanggal_lahir || r.tgl_lahir || r.birth_date || r.tanggal || r.lahir || "";
        const class_name = String(r.kelas || r.class || r.class_name || "").trim();
        const parent_name = String(r.orang_tua || r.parent_name || r.ayah || r.ibu || r.ortu || "").trim() || null;
        const parent_phone = String(r.no_hp || r.phone || r.telp || r.parent_phone || r.hp || "").trim() || null;
        const school_name = String(r.sekolah || r.school || r.school_name || "SD / MI / SMP / SMA Negeri").trim();

        if (!nis || !full_name || !birth_date) return null;

        // Normalize gender
        const g = gender === "LAKI-LAKI" || gender === "LAKI" || gender === "MALE" || gender === "M" ? "L" : "P";

        // Normalize class_name (add "Kelas " prefix if missing)
        let cls = class_name;
        if (cls && !cls.toLowerCase().startsWith("kelas")) {
          cls = `Kelas ${cls}`;
        }

        return { nis, full_name, gender: g, birth_date, class_name: cls, school_name, parent_name, parent_phone };
      })
      .filter(Boolean) as Array<{
        nis: string;
        full_name: string;
        gender: "L" | "P";
        birth_date: unknown;
        class_name: string | null;
        school_name: string;
        parent_name: string | null;
        parent_phone: string | null;
      }>;

    if (studentsToInsert.length === 0) {
      return NextResponse.json({
        error: "Tidak ada data siswa yang valid. Pastikan kolom NIS, Nama, dan Tanggal Lahir terisi.",
      }, { status: 400 });
    }

    // Insert using raw MySQL for reliable date handling
    const dbUrl = process.env.DATABASE_URL || "mysql://root:@localhost:3306/projectgizi";
    const purl = new URL(dbUrl);
    const connection = await mysql.createConnection({
      host: purl.hostname || "localhost",
      port: parseInt(purl.port) || 3306,
      user: purl.username || "root",
      password: purl.password || "",
      database: purl.pathname.slice(1) || "projectgizi",
      connectTimeout: 30000,
    });

    let inserted = 0;
    let skipped = 0;
    const errors: string[] = [];

    for (const s of studentsToInsert) {
      try {
        const [result] = await connection.execute(
          `INSERT INTO students (nis, full_name, gender, birth_date, class_name, school_name, parent_name, parent_phone) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [s.nis, s.full_name, s.gender, String(s.birth_date), s.class_name || null, s.school_name, s.parent_name || null, s.parent_phone || null]
        );
        const res = result as unknown as { affectedRows: number };
        if (res.affectedRows > 0) inserted++;
      } catch (e: unknown) {
        const err = e as { code?: string };
        if (err.code === "ER_DUP_ENTRY") {
          skipped++;
        } else {
          errors.push(`${s.nis} - ${s.full_name}: ${err.code}`);
        }
      }
    }

    await connection.end();

    return NextResponse.json({
      success: true,
      total: studentsToInsert.length,
      inserted,
      skipped,
      errors: errors.slice(0, 5), // only show first 5 errors
      message: `Berhasil mengimpor ${inserted} siswa${skipped > 0 ? `, ${skipped} dilewati (NIS sudah ada)` : ""}`,
    });
  } catch (error) {
    console.error("Import Excel error:", error);
    return NextResponse.json({ error: "Gagal mengimpor file Excel" }, { status: 500 });
  }
}
