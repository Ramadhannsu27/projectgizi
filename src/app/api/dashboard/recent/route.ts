import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { students, measurements } from "@/db/schema";
import { eq, sql, desc } from "drizzle-orm";

export async function GET() {
  try {
    const db = getDb();

    // Get latest measurement per student (one record per student)
    const recent = await db
      .select({
        id: measurements.id,
        student_id: students.id,
        student_name: students.full_name,
        student_class: students.class_name,
        student_school_name: students.school_name,
        height: measurements.height,
        weight: measurements.weight,
        bmi: measurements.bmi,
        status_category: measurements.status_category,
        checked_at: measurements.checked_at,
      })
      .from(students)
      .innerJoin(
        measurements,
        eq(students.id, measurements.student_id)
      )
      .innerJoin(
        sql`(
          SELECT student_id, MAX(checked_at) as max_date
          FROM measurements
          GROUP BY student_id
        ) as latest`,
        sql`latest.student_id = ${measurements.student_id} AND latest.max_date = ${measurements.checked_at}`
      )
      .orderBy(desc(measurements.checked_at))
      .limit(50);

    const formatted = recent.map((m: typeof recent[number]) => ({
      ...m,
      bmi: parseFloat(m.bmi as string),
      height: parseFloat(m.height as string),
      weight: parseFloat(m.weight as string),
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error("Recent measurements error:", error);
    return NextResponse.json([]);
  }
}
