import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { measurements, students } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: studentId } = await params;
    const db = getDb();

    const history = await db
      .select({
        id: measurements.id,
        height: measurements.height,
        weight: measurements.weight,
        bmi: measurements.bmi,
        z_score: measurements.z_score,
        status_category: measurements.status_category,
        notes: measurements.notes,
        checked_at: measurements.checked_at,
      })
      .from(measurements)
      .innerJoin(students, eq(measurements.student_id, students.id))
      .where(eq(students.id, parseInt(studentId)))
      .orderBy(desc(measurements.checked_at));

    const formatted = history.map((m) => ({
      ...m,
      height: parseFloat(m.height as string),
      weight: parseFloat(m.weight as string),
      bmi: parseFloat(m.bmi as string),
      z_score: parseFloat((m.z_score as string) || "0"),
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error("Student history error:", error);
    return NextResponse.json([], { status: 200 });
  }
}
