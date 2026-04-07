import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { students, measurements } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const db = getDb();

    const result = await db
      .update(students)
      .set({
        nis: body.nis,
        full_name: body.full_name,
        gender: body.gender,
        birth_date: new Date(body.birth_date),
        class_name: body.class_name,
        parent_name: body.parent_name || null,
        parent_phone: body.parent_phone || null,
      })
      .where(eq(students.id, parseInt(id)));

    const affectedRows = (result as unknown as { affectedRows: number }).affectedRows;
    if (!affectedRows) {
      return NextResponse.json({ error: "Siswa tidak ditemukan" }, { status: 404 });
    }

    const [updated] = await db
      .select()
      .from(students)
      .where(eq(students.id, parseInt(id)));

    return NextResponse.json(updated);
  } catch (error) {
    console.error("PUT student error:", error);
    return NextResponse.json(
      { error: "Gagal memperbarui data siswa" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = getDb();
    const studentId = parseInt(id);

    // Check if student exists first
    const [student] = await db
      .select()
      .from(students)
      .where(eq(students.id, studentId))
      .limit(1);

    if (!student) {
      return NextResponse.json({ error: "Siswa tidak ditemukan" }, { status: 404 });
    }

    // Delete related measurements first
    await db.delete(measurements).where(eq(measurements.student_id, studentId));

    // Then delete the student
    await db.delete(students).where(eq(students.id, studentId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE student error:", error);
    return NextResponse.json(
      { error: "Gagal menghapus siswa. Pastikan koneksi database aktif." },
      { status: 500 }
    );
  }
}
