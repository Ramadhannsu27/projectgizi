import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { students } from "@/db/schema";
import { eq, like, or } from "drizzle-orm";
import mysql from "mysql2/promise";

export async function GET(request: Request) {
  try {
    const db = getDb();
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    const sort = searchParams.get("sort") || "fifo"; // default FIFO

    let result;
    if (search) {
      result = await db
        .select()
        .from(students)
        .where(
          or(
            like(students.full_name, `%${search}%`),
            like(students.nis, `%${search}%`)
          )
        )
        .limit(50);
    } else {
      result = await db.select().from(students).limit(100);
    }

    // FIFO: NIS ascending (terkecil dulu), LIFO: NIS descending (terbesar dulu)
    result = [...result].sort((a, b) =>
      sort === "lifo"
        ? String(b.nis).localeCompare(String(a.nis))
        : String(a.nis).localeCompare(String(b.nis))
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error("GET students error:", error);
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Use raw MySQL connection for reliable date handling
    const connection = await mysql.createConnection({
      host: "localhost",
      user: "root",
      database: "projectgizi",
    });

    try {
      const [result] = await connection.execute(
        `INSERT INTO students (nis, full_name, gender, birth_date, class_name, school_name, parent_name, parent_phone) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          body.nis,
          body.full_name,
          body.gender,
          body.birth_date,
          body.class_name,
          body.school_name || "SD / MI / SMP / SMA Negeri",
          body.parent_name || null,
          body.parent_phone || null,
        ]
      );

      const insertId = (result as unknown as { insertId: number }).insertId;

      // Fetch the created student back
      const [rows] = await connection.execute(
        `SELECT * FROM students WHERE id = ?`,
        [insertId]
      );

      await connection.end();

      const student = (rows as Record<string, unknown>[])[0];
      return NextResponse.json(student);
    } finally {
      await connection.end();
    }
  } catch (error: unknown) {
    const err = error as { code?: string; message?: string };
    console.error("POST student error:", err);

    if (err.code === "ER_DUP_ENTRY") {
      return NextResponse.json(
        { error: "NIS sudah terdaftar. Gunakan NIS yang berbeda." },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: `Gagal menyimpan data siswa: ${err.code} - ${err.message}` },
      { status: 500 }
    );
  }
}
