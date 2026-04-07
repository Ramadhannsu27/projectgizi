import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { measurements, students } from "@/db/schema";
import { eq, desc, and, sql } from "drizzle-orm";

export async function GET(request: Request) {
  try {
    const db = getDb();
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    const classFilter = searchParams.get("class");
    const statusFilter = searchParams.get("status");

    let query = db
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
        checked_at: measurements.checked_at,
      })
      .from(measurements)
      .innerJoin(students, eq(measurements.student_id, students.id))
      .orderBy(desc(measurements.checked_at))
      .limit(100);

    const result = await query;

    // Apply filters in memory (case-insensitive substring match)
    let filtered: typeof result = result;
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter((r: typeof result[number]) =>
        r.student_name?.toLowerCase().includes(q) ||
        r.student_class?.toLowerCase().includes(q)
      );
    }
    if (classFilter) {
      filtered = filtered.filter((r: typeof result[number]) =>
        r.student_class?.toLowerCase().includes(classFilter.toLowerCase())
      );
    }
    if (statusFilter) {
      filtered = filtered.filter((r: typeof result[number]) =>
        r.status_category === statusFilter
      );
    }

    return NextResponse.json(filtered);
  } catch (error) {
    console.error("GET measurements error:", error);
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const db = getDb();

    // Get user_id from token (simplified for demo)
    const userId = 1;

    // Recalculate server-side to ensure correct status
    let status_category = body.status_category || "Normal";
    let zScore = body.z_score || "0";

    try {
      const studentRes = await fetch(
        `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/calculate`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            student_id: body.student_id,
            height: body.height,
            weight: body.weight,
          }),
        }
      );
      if (studentRes.ok) {
        const calc = await studentRes.json();
        status_category = calc.status || status_category;
        zScore = calc.zScore?.toString() || "0";
      }
    } catch {
      // Fallback: use client-sent values
    }

    const result = await db
      .insert(measurements)
      .values({
        student_id: body.student_id,
        user_id: userId,
        height: body.height.toString(),
        weight: body.weight.toString(),
        bmi: body.bmi.toString(),
        z_score: zScore,
        status_category,
        notes: body.notes || null,
        is_synced: true,
      });

    const insertId = (result as unknown as { insertId: number }).insertId;

    return NextResponse.json({ id: insertId });
  } catch (error) {
    console.error("POST measurement error:", error);
    return NextResponse.json(
      { error: "Gagal menyimpan data pemeriksaan" },
      { status: 500 }
    );
  }
}
