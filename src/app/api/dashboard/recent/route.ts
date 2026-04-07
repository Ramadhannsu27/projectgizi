import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { students, measurements } from "@/db/schema";
import { eq, desc, sql } from "drizzle-orm";

export async function GET() {
  try {
    const db = getDb();

    const recent = await db
      .select({
        id: measurements.id,
        student_name: students.full_name,
        student_class: students.class_name,
        height: measurements.height,
        weight: measurements.weight,
        bmi: measurements.bmi,
        status_category: measurements.status_category,
        checked_at: measurements.checked_at,
      })
      .from(measurements)
      .innerJoin(students, eq(measurements.student_id, students.id))
      .orderBy(desc(measurements.checked_at))
      .limit(10);

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
