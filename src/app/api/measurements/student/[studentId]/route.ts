import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { measurements, students } from "@/db/schema";
import { eq, desc, sql } from "drizzle-orm";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ studentId: string }> }
) {
  try {
    const { studentId } = await params;
    const db = getDb();

    // Get student info
    const [student] = await db
      .select()
      .from(students)
      .where(eq(students.id, parseInt(studentId)))
      .limit(1);

    if (!student) {
      return NextResponse.json({ error: "Siswa tidak ditemukan" }, { status: 404 });
    }

    // Get all measurements for this student
    const history = await db
      .select({
        id: measurements.id,
        student_name: students.full_name,
        student_class: students.class_name,
        height: measurements.height,
        weight: measurements.weight,
        bmi: measurements.bmi,
        status_category: measurements.status_category,
        status_variant: sql<string>`CASE
          WHEN ${measurements.status_category} = 'Normal' THEN 'normal'
          WHEN ${measurements.status_category} = 'Obesitas' THEN 'obesitas'
          WHEN ${measurements.status_category} = 'Overweight' THEN 'overweight'
          WHEN ${measurements.status_category} = 'Stunting' THEN 'stunting'
          WHEN ${measurements.status_category} = 'Stunting Berat' THEN 'severely_stunting'
          ELSE 'secondary'
        END`.as("status_variant"),
        notes: measurements.notes,
        checked_at: measurements.checked_at,
      })
      .from(measurements)
      .innerJoin(students, eq(measurements.student_id, students.id))
      .where(eq(measurements.student_id, parseInt(studentId)))
      .orderBy(desc(measurements.checked_at));

    return NextResponse.json({
      student,
      history: history.map((h) => ({
        ...h,
        height: parseFloat(h.height),
        weight: parseFloat(h.weight),
        bmi: parseFloat(h.bmi),
      })),
    });
  } catch (error) {
    console.error("GET student history error:", error);
    return NextResponse.json({ error: "Gagal mengambil riwayat" }, { status: 500 });
  }
}
